package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/appointment"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/services"
)

func GetAppointments(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	filter := appointment.AppointmentFilter{
		ID:       q.Get("id"),
		Paciente: q.Get("patientId"),
		Medico:   q.Get("doctorId"),
		Hora:     q.Get("date"),
		Status:   q.Get("status"),
		Motivo:   q.Get("reason"),
	}

	appointments, err := services.GetAppointments(r.Context(), filter)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(appointments)
}
