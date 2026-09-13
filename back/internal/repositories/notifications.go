package repositories

import (
	"context"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/notification"
)

func CreateNotification(ctx context.Context, n notification.Notification) error {
	n.ID = newID()
	_, err := pool.Exec(ctx,
		`INSERT INTO notificacoes (id, msg, data, usr, tipo, lida) VALUES ($1,$2,$3,$4,$5,FALSE)`,
		n.ID, n.Msg, n.Data, n.Usr, n.Tipo)
	return err
}

func MarkNotificationRead(ctx context.Context, id, userID string) error {
	_, err := pool.Exec(ctx,
		`UPDATE notificacoes SET lida = TRUE WHERE id = $1 AND usr = $2`, id, userID)
	return err
}
