package services

import (
	"context"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/dto"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/appointment"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/doctor"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/notification"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/patient"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/repositories"
)

func GetPatients(ctx context.Context, f patient.PatientFilter) ([]dto.Patient, error) {
	rows, err := repositories.ListPatients(ctx, f)
	if err != nil {
		return nil, err
	}
	out := make([]dto.Patient, 0, len(rows))
	for _, p := range rows {
		out = append(out, dto.PatientFromEntity(p))
	}
	return out, nil
}

func GetDoctors(ctx context.Context, f doctor.DoctorFilter) ([]dto.Doctor, error) {
	rows, err := repositories.ListDoctors(ctx, f)
	if err != nil {
		return nil, err
	}
	out := make([]dto.Doctor, 0, len(rows))
	for _, d := range rows {
		out = append(out, dto.DoctorFromEntity(d))
	}
	return out, nil
}

func GetAppointments(ctx context.Context, f appointment.AppointmentFilter) ([]dto.Appointment, error) {
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

func GetNotifications(ctx context.Context, f notification.NotificationFilter) ([]dto.Notification, error) {
	rows, err := repositories.ListNotifications(ctx, f)
	if err != nil {
		return nil, err
	}
	out := make([]dto.Notification, 0, len(rows))
	for _, n := range rows {
		out = append(out, dto.NotificationFromEntity(n))
	}
	return out, nil
}
