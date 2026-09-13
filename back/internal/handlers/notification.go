package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/notification"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/services"
)

func GetNotifications(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	filter := notification.NotificationFilter{
		ID:   q.Get("id"),
		Msg:  q.Get("text"),
		Data: q.Get("date"),
		Usr:  q.Get("userId"),
		Tipo: q.Get("type"),
		Lida: q.Get("read"),
	}

	notifications, err := services.GetNotifications(r.Context(), filter)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notifications)
}
