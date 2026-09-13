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
		Nome:          q.Get("nome"),
		Email:         q.Get("email"),
		Telefone:      q.Get("telefone"),
		Nascimento:    q.Get("nascimento"),
		CPF:           q.Get("cpf"),
		CRM:           q.Get("crm"),
		Biografia:     q.Get("biografia"),
		AvaliacaoSoma: q.Get("avaliacao_soma"),
		NConsultas:    q.Get("n_consultas"),
		Especialidade: q.Get("especialidade"),
		Senha:         q.Get("senha"),
	}

	doctors, err := services.GetDoctors(r.Context(), filter)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(doctors)
}
