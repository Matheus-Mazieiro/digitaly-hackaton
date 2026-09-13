package handlers

import (
	"net/http"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/auth"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/services"
)

// GetNotifications lista as notificações do usuário logado.
func GetNotifications(w http.ResponseWriter, r *http.Request) {
	list, err := services.ListNotificationsByUser(r.Context(), auth.UserID(r.Context()))
	if err != nil {
		writeErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, list)
}

// MarkNotificationRead marca uma notificação do usuário como lida.
func MarkNotificationRead(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := services.MarkNotificationRead(r.Context(), auth.UserID(r.Context()), id); err != nil {
		writeErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}
