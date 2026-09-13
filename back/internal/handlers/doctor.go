package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/doctor"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/services"
)

func GetDoctors(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	filter := doctor.DoctorFilter{
		ID:            q.Get("id"),
		Nome:          q.Get("name"),
		Email:         q.Get("email"),
		Telefone:      q.Get("phone"),
		Nascimento:    q.Get("birthDate"),
		CPF:           q.Get("cpf"),
		CRM:           q.Get("crm"),
		Biografia:     q.Get("bio"),
		Especialidade: q.Get("specialty"),
	}

	doctors, err := services.GetDoctors(r.Context(), filter)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(doctors)
}
