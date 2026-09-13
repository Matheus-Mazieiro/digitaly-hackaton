package repositories

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/appointment"
)

func CreateAppointment(ctx context.Context, a appointment.Appointment) (string, error) {
	id := newID()
	_, err := pool.Exec(ctx,
		`INSERT INTO consultas (id, paciente, medico, hora, status, motivo)
		 VALUES ($1,$2,$3,$4,$5,$6)`,
		id, a.Paciente, a.Medico, a.Hora, a.Status, a.Motivo)
	if err != nil {
		return "", err
	}
	return id, nil
}

func GetAppointmentByID(ctx context.Context, id string) (appointment.Appointment, error) {
	var a appointment.Appointment
	row := pool.QueryRow(ctx,
		`SELECT id, paciente, medico, hora, status,
		        COALESCE(motivo,''), COALESCE(prontuario,''), COALESCE(resumo,''), COALESCE(receita,''), COALESCE(link,'')
		 FROM consultas WHERE id = $1`, id)
	err := row.Scan(&a.ID, &a.Paciente, &a.Medico, &a.Hora, &a.Status, &a.Motivo, &a.Prontuario, &a.Resumo, &a.Receita, &a.Link)
	if errors.Is(err, pgx.ErrNoRows) {
		return a, ErrNotFound
	}
	return a, err
}

func UpdateAppointmentStatus(ctx context.Context, id, status string) error {
	_, err := pool.Exec(ctx, `UPDATE consultas SET status = $2 WHERE id = $1`, id, status)
	return err
}
