package services

import (
	"context"
	"fmt"
	"time"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/dto"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/appointment"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/repositories"
)

type CreateAppointmentInput struct {
	DoctorID string `json:"doctorId"`
	Date     string `json:"date"` // YYYY-MM-DD
	Time     string `json:"time"` // HH:MM
	Motivo   string `json:"motivo"`
}

func ListAppointmentsByUser(ctx context.Context, userID, role string) ([]dto.Appointment, error) {
	f := appointment.AppointmentFilter{}
	if role == "doctor" {
		f.Medico = userID
	} else {
		f.Paciente = userID
	}
	rows, err := repositories.ListAppointments(ctx, f)
	if err != nil {
		return nil, err
	}
	out := make([]dto.Appointment, 0, len(rows))
	for _, a := range rows {
		out = append(out, dto.AppointmentFromEntity(a))
	}
	return out, nil
}

func GetAppointmentByID(ctx context.Context, userID, role, id string) (dto.Appointment, error) {
	a, err := repositories.GetAppointmentByID(ctx, id)
	if err != nil {
		return dto.Appointment{}, err
	}
	if (role == "doctor" && a.Medico != userID) || (role == "patient" && a.Paciente != userID) {
		return dto.Appointment{}, repositories.ErrNotFound
	}
	return dto.AppointmentFromEntity(a), nil
}

func CreateAppointment(ctx context.Context, patientID string, in CreateAppointmentInput) (string, error) {
	if in.DoctorID == "" {
		return "", fmt.Errorf("%w: doctorId é obrigatório", ErrValidation)
	}
	if in.Motivo == "" {
		return "", fmt.Errorf("%w: motivo é obrigatório", ErrValidation)
	}
	hora, err := time.ParseInLocation("2006-01-02 15:04", in.Date+" "+in.Time, time.Local)
	if err != nil {
		return "", fmt.Errorf("%w: data/hora inválidos (date=YYYY-MM-DD, time=HH:MM)", ErrValidation)
	}

	// Só permite agendar em horário LIVRE do médico.
	slots, err := GetAvailableSlots(ctx, in.DoctorID, in.Date)
	if err != nil {
		return "", err
	}
	if !contains(slots, in.Time) {
		return "", fmt.Errorf("%w: horário indisponível", ErrConflict)
	}

	p, err := repositories.GetPatientByID(ctx, patientID)
	if err != nil {
		return "", err
	}

	id, err := repositories.CreateAppointment(ctx, appointment.Appointment{
		Paciente: patientID,
		Medico:   in.DoctorID,
		Hora:     hora,
		Status:   "agendada",
		Motivo:   in.Motivo,
	})
	if err != nil {
		return "", err
	}

	// Código de confirmação por e-mail (reusa a infra do BA).
	code, err := generateCode()
	if err != nil {
		return "", err
	}
	if err := sendCode(p.Email, code); err != nil {
		return "", fmt.Errorf("não foi possível enviar o código de confirmação: %v", err)
	}
	token, err := generateToken()
	if err != nil {
		return "", err
	}
	if err := repositories.CreateVerification(ctx, repositories.Verification{
		Token:     token,
		CodeHash:  hashCode(code),
		Kind:      "appointment",
		Role:      "patient",
		UserID:    patientID,
		Email:     p.Email,
		RefID:     id,
		ExpiresAt: time.Now().Add(5 * time.Minute),
	}); err != nil {
		return "", err
	}
	return id, nil
}

func ConfirmAppointment(ctx context.Context, patientID, appointmentID, code string) error {
	v, err := repositories.GetVerificationByRef(ctx, appointmentID, "appointment")
	if err != nil || time.Now().After(v.ExpiresAt) {
		return fmt.Errorf("%w: código inválido ou expirado", ErrValidation)
	}
	if v.CodeHash != hashCode(code) {
		return fmt.Errorf("%w: código inválido", ErrValidation)
	}

	a, err := repositories.GetAppointmentByID(ctx, appointmentID)
	if err != nil {
		return err
	}
	if a.Paciente != patientID {
		return repositories.ErrNotFound
	}

	if err := repositories.UpdateAppointmentStatus(ctx, appointmentID, "confirmada"); err != nil {
		return err
	}
	_ = repositories.DeleteVerification(ctx, v.Token)

	notify(ctx, a.Medico, "confirm",
		fmt.Sprintf("Nova consulta confirmada para %s às %s", a.Hora.Format("02/01/2006"), a.Hora.Format("15:04")))
	return nil
}

func StartAppointment(ctx context.Context, doctorID, appointmentID string) error {
	a, err := repositories.GetAppointmentByID(ctx, appointmentID)
	if err != nil {
		return err
	}
	if a.Medico != doctorID {
		return repositories.ErrNotFound
	}
	if err := repositories.UpdateAppointmentStatus(ctx, appointmentID, "em_andamento"); err != nil {
		return err
	}
	notify(ctx, a.Paciente, "alert", "Seu médico entrou na sala. A consulta começou!")
	return nil
}

func contains(list []string, s string) bool {
	for _, v := range list {
		if v == s {
			return true
		}
	}
	return false
}
