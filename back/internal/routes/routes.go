package routes

import (
	"net/http"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/handlers"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/handlers/patient"
)

func Register(mux *http.ServeMux) {
	mux.HandleFunc("/health", handlers.Health)
	mux.HandleFunc("/ready", handlers.Ready)
	mux.HandleFunc("/patients", patient.GetPatients)
}
