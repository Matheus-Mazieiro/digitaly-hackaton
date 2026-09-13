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
		ID:         q.Get("id"),
		Paciente:   q.Get("paciente"),
		Medico:     q.Get("medico"),
		Hora:       q.Get("hora"),
		Status:     q.Get("status"),
		Motivo:     q.Get("motivo"),
		Prontuario: q.Get("prontuario"),
		Resumo:     q.Get("resumo"),
		Receita:    q.Get("receita"),
		Link:       q.Get("link"),
	}

	appointments, err := services.GetAppointments(r.Context(), filter)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(appointments)
}
