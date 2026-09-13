package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/patient"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/services"
)

func GetPatients(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	filter := patient.PatientFilter{
		ID:         q.Get("id"),
		Nome:       q.Get("nome"),
		Email:      q.Get("email"),
		Telefone:   q.Get("telefone"),
		Nascimento: q.Get("nascimento"),
		CPF:        q.Get("cpf"),
		Senha:      q.Get("senha"),
	}

	patients, err := services.GetPatients(r.Context(), filter)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(patients)
}
