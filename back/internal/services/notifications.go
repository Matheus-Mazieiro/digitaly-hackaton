package services

import (
	"context"
	"time"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/dto"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/notification"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/repositories"
)

func ListNotificationsByUser(ctx context.Context, userID string) ([]dto.Notification, error) {
	rows, err := repositories.ListNotifications(ctx, notification.NotificationFilter{Usr: userID})
	if err != nil {
		return nil, err
	}
	out := make([]dto.Notification, 0, len(rows))
	for _, n := range rows {
		out = append(out, dto.NotificationFromEntity(n))
	}
	return out, nil
}

func MarkNotificationRead(ctx context.Context, userID, id string) error {
	return repositories.MarkNotificationRead(ctx, id, userID)
}

// notify cria uma notificação in-app (melhor esforço: ignora erro de escrita).
func notify(ctx context.Context, userID, tipo, msg string) {
	_ = repositories.CreateNotification(ctx, notification.Notification{
		Msg:  msg,
		Data: time.Now(),
		Usr:  userID,
		Tipo: tipo,
	})
}
