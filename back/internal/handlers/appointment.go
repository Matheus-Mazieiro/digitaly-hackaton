package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/auth"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/services"
)

// GetAppointments lista as consultas do usuário logado.
func GetAppointments(w http.ResponseWriter, r *http.Request) {
	list, err := services.ListAppointmentsByUser(r.Context(), auth.UserID(r.Context()), auth.Role(r.Context()))
	if err != nil {
		writeErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, list)
}

// GetAppointmentDetail devolve uma consulta (somente se o usuário é dono).
func GetAppointmentDetail(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	appt, err := services.GetAppointmentByID(r.Context(), auth.UserID(r.Context()), auth.Role(r.Context()), id)
	if err != nil {
		writeErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, appt)
}

// CreateAppointment agenda uma consulta (só paciente).
func CreateAppointment(w http.ResponseWriter, r *http.Request) {
	if auth.Role(r.Context()) != "patient" {
		http.Error(w, "só pacientes podem agendar", http.StatusForbidden)
		return
	}
	var in services.CreateAppointmentInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "body inválido", http.StatusBadRequest)
		return
	}
	id, err := services.CreateAppointment(r.Context(), auth.UserID(r.Context()), in)
	if err != nil {
		writeErr(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"id": id})
}

// ConfirmAppointment confirma o agendamento com o código enviado por e-mail.
func ConfirmAppointment(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var in struct {
		Code string `json:"code"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "body inválido", http.StatusBadRequest)
		return
	}
	if err := services.ConfirmAppointment(r.Context(), auth.UserID(r.Context()), id, in.Code); err != nil {
		writeErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// StartAppointment inicia a teleconsulta (só médico).
func StartAppointment(w http.ResponseWriter, r *http.Request) {
	if auth.Role(r.Context()) != "doctor" {
		http.Error(w, "só médicos podem iniciar a consulta", http.StatusForbidden)
		return
	}
	id := r.PathValue("id")
	if err := services.StartAppointment(r.Context(), auth.UserID(r.Context()), id); err != nil {
		writeErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}
