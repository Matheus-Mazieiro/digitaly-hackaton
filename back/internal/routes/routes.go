package routes

import (
	"net/http"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/handlers"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/ws"
)

func Register(mux *http.ServeMux) {
	mux.HandleFunc("/health", handlers.Health)
	mux.HandleFunc("/ready", handlers.Ready)
	mux.HandleFunc("/patients", handlers.GetPatients)
	mux.HandleFunc("/doctors", handlers.GetDoctors)
	mux.HandleFunc("/appointments", handlers.GetAppointments)
	mux.HandleFunc("/notifications", handlers.GetNotifications)
	mux.HandleFunc("/api/realtime/session", handlers.RealtimeSession)
	mux.HandleFunc("/api/ai/insights", handlers.AIInsights)
	mux.HandleFunc("/api/ai/summary", handlers.AISummary)
	mux.HandleFunc("/api/recordings", handlers.UploadRecording)





	mux.HandleFunc("/api/specialties", handlers.GetSpecialties)
	mux.HandleFunc("/api/patients", handlers.GetPatients)
	mux.HandleFunc("/api/doctors", handlers.GetDoctors)
	mux.HandleFunc("/api/appointments", handlers.GetAppointments)
	mux.HandleFunc("/api/notifications", handlers.GetNotifications)

	mux.HandleFunc("/ws/signal", ws.SignalHandler)
}
