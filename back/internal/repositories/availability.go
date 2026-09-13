package repositories

import (
	"context"
)

// ListBookedTimes devolve os horários ("HH:MM") ocupados por consultas ativas
// de um médico em uma data específica.
func ListBookedTimes(ctx context.Context, doctorID, date string) ([]string, error) {
	rows, err := pool.Query(ctx,
		`SELECT to_char(hora, 'HH24:MI')
		 FROM consultas
		 WHERE medico = $1 AND hora::date = $2::date
		   AND status IN ('agendada','confirmada','em_andamento')`,
		doctorID, date)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]string, 0)
	for rows.Next() {
		var t string
		if err := rows.Scan(&t); err != nil {
			return nil, err
		}
		out = append(out, t)
	}
	return out, rows.Err()
}
