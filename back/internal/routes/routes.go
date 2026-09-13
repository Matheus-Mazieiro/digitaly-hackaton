package routes

import (
	"net/http"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/handlers"
)

func Register(mux *http.ServeMux) {
	mux.HandleFunc("/health", handlers.Health)
	mux.HandleFunc("/ready", handlers.Ready)
	mux.HandleFunc("/patients", handlers.GetPatients)
	mux.HandleFunc("/doctors", handlers.GetDoctors)
	mux.HandleFunc("/appointments", handlers.GetAppointments)
	mux.HandleFunc("/notifications", handlers.GetNotifications)
}
