package routes

import (
	"net/http"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/auth"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/config"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/handlers"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/ws"
)

func Register(mux *http.ServeMux, cfg config.Config) {
	mux.HandleFunc("/health", handlers.Health)
	mux.HandleFunc("/ready", handlers.Ready)

	mux.HandleFunc("/api/specialties", handlers.GetSpecialties)
	mux.HandleFunc("/api/patients", handlers.GetPatients)
	mux.HandleFunc("/api/doctors", handlers.GetDoctors)
	mux.HandleFunc("/api/appointments", handlers.GetAppointments)
	mux.HandleFunc("/api/notifications", handlers.GetNotifications)

	mux.HandleFunc("/api/auth/signup", handlers.Signup)
	mux.HandleFunc("/api/auth/login", handlers.Login)
	mux.HandleFunc("/api/auth/verify", handlers.Verify)
	mux.HandleFunc("/api/auth/resend", handlers.Resend)
	mux.HandleFunc("/api/auth/me", auth.Middleware(cfg.JWTSecret, handlers.Me))

	mux.HandleFunc("/ws/signal", ws.SignalHandler)
}
