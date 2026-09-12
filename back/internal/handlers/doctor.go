package handlers

import (
	"encoding/json"
	"net/http"

	"backend/internal/services"
)

func GetDoctors(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	filter := models.DoctorFilter{
		ID:            query.Get("id"),
		Nome:          query.Get("nome"),
		Email:         query.Get("email"),
		Telefone:      query.Get("telefone"),
		Nascimento:    query.Get("nascimento"),
		CPF:           query.Get("cpf"),
		CRM:           query.Get("crm"),
		Biografia:     query.Get("biografia"),
		AvaliacaoSoma: query.Get("avaliacao_soma"),
		NConsultas:    query.Get("n_consultas"),
		Especialidade: query.Get("especialidade"),
		Senha:         query.Get("senha"),
	}

	doctors, err := services.GetDoctors(filter)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(doctors)
}
