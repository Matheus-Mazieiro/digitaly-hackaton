package handlers

import (
	"encoding/json"
	"net/http"

	"backend/internal/models"
	"backend/internal/services"
)

func GetPatients(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	filter := models.PatientFilter{
		ID:         query.Get("id"),
		Nome:       query.Get("nome"),
		Email:      query.Get("email"),
		Telefone:   query.Get("telefone"),
		Nascimento: query.Get("nascimento"),
		CPF:        query.Get("cpf"),
		Senha:      query.Get("senha"),
	}

	patients, err := services.GetPatients(filter)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(patients)
}
