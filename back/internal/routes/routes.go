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

	// IA (merge anterior)
	mux.HandleFunc("/api/realtime/session", handlers.RealtimeSession)
	mux.HandleFunc("/api/ai/insights", handlers.AIInsights)
	mux.HandleFunc("/api/ai/summary", handlers.AISummary)
	mux.HandleFunc("/api/recordings", handlers.UploadRecording)

	// Público (leitura)
	mux.HandleFunc("GET /api/specialties", handlers.GetSpecialties)
	mux.HandleFunc("GET /api/patients", handlers.GetPatients)
	mux.HandleFunc("GET /api/doctors", handlers.GetDoctors)
	mux.HandleFunc("GET /api/doctors/{id}/slots", handlers.GetDoctorSlots)

	// Auth
	mux.HandleFunc("/api/auth/signup", handlers.Signup)
	mux.HandleFunc("/api/auth/login", handlers.Login)
	mux.HandleFunc("/api/auth/verify", handlers.Verify)
	mux.HandleFunc("/api/auth/resend", handlers.Resend)
	mux.HandleFunc("/api/auth/me", auth.Middleware(cfg.JWTSecret, handlers.Me))

	// Consultas (protegidas)
	mux.HandleFunc("GET /api/appointments", auth.Middleware(cfg.JWTSecret, handlers.GetAppointments))
	mux.HandleFunc("POST /api/appointments", auth.Middleware(cfg.JWTSecret, handlers.CreateAppointment))
	mux.HandleFunc("GET /api/appointments/{id}", auth.Middleware(cfg.JWTSecret, handlers.GetAppointmentDetail))
	mux.HandleFunc("POST /api/appointments/{id}/confirm", auth.Middleware(cfg.JWTSecret, handlers.ConfirmAppointment))
	mux.HandleFunc("POST /api/appointments/{id}/start", auth.Middleware(cfg.JWTSecret, handlers.StartAppointment))

	// Notificações (protegidas)
	mux.HandleFunc("GET /api/notifications", auth.Middleware(cfg.JWTSecret, handlers.GetNotifications))
	mux.HandleFunc("PATCH /api/notifications/{id}/read", auth.Middleware(cfg.JWTSecret, handlers.MarkNotificationRead))

	mux.HandleFunc("/ws/signal", ws.SignalHandler)
}
