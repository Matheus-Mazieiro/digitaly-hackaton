package repositories

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/appointment"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/doctor"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/notification"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/patient"
)

var pool *pgxpool.Pool

// Init define o pool global usado pelos repositórios.
func Init(p *pgxpool.Pool) { pool = p }

type filterPart struct {
	expr string // expressão SQL à esquerda do "=" (ex.: "id", "nascimento::text")
	val  string
}

// buildWhere monta " WHERE expr = $1 AND expr2 = $2 ..." a partir dos filtros não-vazios.
func buildWhere(parts []filterPart) (string, []any) {
	var conds []string
	var args []any
	for _, p := range parts {
		if p.val == "" {
			continue
		}
		args = append(args, p.val)
		conds = append(conds, fmt.Sprintf("%s = $%d", p.expr, len(args)))
	}
	if len(conds) == 0 {
		return "", args
	}
	return " WHERE " + strings.Join(conds, " AND "), args
}

func ListPatients(ctx context.Context, f patient.PatientFilter) ([]patient.Patient, error) {
	if pool == nil {
		return nil, errors.New("repositories: pool não inicializado")
	}
	// "senha" não entra no WHERE (nunca filtrar por senha).
	where, args := buildWhere([]filterPart{
		{"id", f.ID},
		{"nome", f.Nome},
		{"email", f.Email},
		{"telefone", f.Telefone},
		{"nascimento::text", f.Nascimento},
		{"cpf", f.CPF},
	})

	rows, err := pool.Query(ctx,
		`SELECT id, nome, email, telefone, nascimento, cpf, senha, ativo FROM pacientes`+where+` ORDER BY nome`,
		args...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]patient.Patient, 0)
	for rows.Next() {
		var p patient.Patient
		if err := rows.Scan(&p.ID, &p.Nome, &p.Email, &p.Telefone, &p.Nascimento, &p.CPF, &p.Senha, &p.Ativo); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

func ListDoctors(ctx context.Context, f doctor.DoctorFilter) ([]doctor.Doctor, error) {
	if pool == nil {
		return nil, errors.New("repositories: pool não inicializado")
	}
	where, args := buildWhere([]filterPart{
		{"id", f.ID},
		{"nome", f.Nome},
		{"email", f.Email},
		{"telefone", f.Telefone},
		{"nascimento::text", f.Nascimento},
		{"cpf", f.CPF},
		{"crm", f.CRM},
		{"biografia", f.Biografia},
		{"avaliacao_soma::text", f.AvaliacaoSoma},
		{"n_consultas::text", f.NConsultas},
		{"especialidade", f.Especialidade},
	})

	rows, err := pool.Query(ctx,
		`SELECT id, nome, email, telefone, nascimento, cpf, crm, biografia, avaliacao_soma, n_consultas, especialidade, senha, ativo FROM medicos`+where+` ORDER BY nome`,
		args...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]doctor.Doctor, 0)
	for rows.Next() {
		var d doctor.Doctor
		if err := rows.Scan(&d.ID, &d.Nome, &d.Email, &d.Telefone, &d.Nascimento, &d.CPF, &d.CRM, &d.Biografia, &d.AvaliacaoSoma, &d.NConsultas, &d.Especialidade, &d.Senha, &d.Ativo); err != nil {
			return nil, err
		}
		out = append(out, d)
	}
	return out, rows.Err()
}

func ListAppointments(ctx context.Context, f appointment.AppointmentFilter) ([]appointment.Appointment, error) {
	if pool == nil {
		return nil, errors.New("repositories: pool não inicializado")
	}
	where, args := buildWhere([]filterPart{
		{"id", f.ID},
		{"paciente", f.Paciente},
		{"medico", f.Medico},
		{"hora::date::text", f.Hora},
		{"status", f.Status},
		{"motivo", f.Motivo},
		{"prontuario", f.Prontuario},
		{"resumo", f.Resumo},
		{"receita", f.Receita},
		{"link", f.Link},
	})

	rows, err := pool.Query(ctx,
		`SELECT id, paciente, medico, hora, status,
		        COALESCE(motivo, ''), COALESCE(prontuario, ''), COALESCE(resumo, ''), COALESCE(receita, ''), COALESCE(link, '')
		 FROM consultas`+where+` ORDER BY hora`,
		args...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]appointment.Appointment, 0)
	for rows.Next() {
		var a appointment.Appointment
		if err := rows.Scan(&a.ID, &a.Paciente, &a.Medico, &a.Hora, &a.Status, &a.Motivo, &a.Prontuario, &a.Resumo, &a.Receita, &a.Link); err != nil {
			return nil, err
		}
		out = append(out, a)
	}
	return out, rows.Err()
}

func ListNotifications(ctx context.Context, f notification.NotificationFilter) ([]notification.Notification, error) {
	if pool == nil {
		return nil, errors.New("repositories: pool não inicializado")
	}
	where, args := buildWhere([]filterPart{
		{"id", f.ID},
		{"msg", f.Msg},
		{"data::date::text", f.Data},
		{"usr", f.Usr},
		{"tipo", f.Tipo},
		{"lida::text", f.Lida},
	})

	rows, err := pool.Query(ctx,
		`SELECT id, msg, data, usr, tipo, lida FROM notificacoes`+where+` ORDER BY data DESC`,
		args...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]notification.Notification, 0)
	for rows.Next() {
		var n notification.Notification
		if err := rows.Scan(&n.ID, &n.Msg, &n.Data, &n.Usr, &n.Tipo, &n.Lida); err != nil {
			return nil, err
		}
		out = append(out, n)
	}
	return out, rows.Err()
}
