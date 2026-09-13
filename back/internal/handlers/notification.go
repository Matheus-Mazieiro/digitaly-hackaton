package handlers

import (
	"encoding/json"
	"net/http"

	"backend/internal/models"
	"backend/internal/services"
)

func GetNotification(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	filter := models.NotificationFilter{
		ID:   query.Get("id"),
		Msg:  query.Get("msg"),
		Data: query.Get("data"),
		Usr:  query.Get("usr"),
	}

	notification, err := services.GetNotification(filter)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notification)
}
