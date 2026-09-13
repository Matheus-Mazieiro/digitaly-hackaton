package handlers

import (
	"encoding/json"
	"net/http"

	"backend/internal/models"
	"backend/internal/services"
)

func GetAppointments(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	filter := models.AppointmentFilter{
		ID:         query.Get("id"),
		Paciente:   query.Get("paciente"),
		Medico:     query.Get("medico"),
		Hora:       query.Get("hora"),
		Status:     query.Get("status"),
		Prontuario: query.Get("prontuario"),
		Resumo:     query.Get("resumo"),
		Receita:    query.Get("receita"),
		Link:       query.Get("link"),
		Reason:     query.Get("reason"),
	}

	appointments, err := services.GetAppointments(filter)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(appointments)
}
