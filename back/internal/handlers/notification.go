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
		Msg:  q.Get("msg"),
		Data: q.Get("data"),
		Usr:  q.Get("usr"),
		Tipo: q.Get("tipo"),
		Lida: q.Get("lida"),
	}

	notifications, err := services.GetNotifications(r.Context(), filter)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notifications)
}
