package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/services"
)

func GetSpecialties(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(services.GetSpecialties())
}
