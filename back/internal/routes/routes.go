package routes

import (
	"net/http"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/handlers"
)

func Register(mux *http.ServeMux) {
	mux.HandleFunc("/health", handlers.Health)
	mux.HandleFunc("/ready", handlers.Ready)
}
