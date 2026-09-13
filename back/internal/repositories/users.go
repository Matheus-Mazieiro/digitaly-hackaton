package repositories

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/doctor"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/patient"
)

var (
	ErrNotFound  = errors.New("registro não encontrado")
	ErrDuplicate = errors.New("registro duplicado")
)

func newID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func CreatePatient(ctx context.Context, p patient.Patient) (string, error) {
	id := newID()
	_, err := pool.Exec(ctx,
		`INSERT INTO pacientes (id, nome, email, telefone, nascimento, cpf, senha, ativo)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,FALSE)`,
		id, p.Nome, p.Email, p.Telefone, p.Nascimento.Format("2006-01-02"), p.CPF, p.Senha)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return "", ErrDuplicate
		}
		return "", err
	}
	return id, nil
}

func CreateDoctor(ctx context.Context, d doctor.Doctor) (string, error) {
	id := newID()
	_, err := pool.Exec(ctx,
		`INSERT INTO medicos (id, nome, email, telefone, nascimento, cpf, crm, biografia, especialidade, senha, ativo)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,FALSE)`,
		id, d.Nome, d.Email, d.Telefone, d.Nascimento.Format("2006-01-02"), d.CPF, d.CRM, d.Biografia, d.Especialidade, d.Senha)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return "", ErrDuplicate
		}
		return "", err
	}
	return id, nil
}

func GetPatientByEmail(ctx context.Context, email string) (patient.Patient, error) {
	var p patient.Patient
	row := pool.QueryRow(ctx,
		`SELECT id, nome, email, telefone, nascimento, cpf, senha, ativo FROM pacientes WHERE email = $1`, email)
	err := row.Scan(&p.ID, &p.Nome, &p.Email, &p.Telefone, &p.Nascimento, &p.CPF, &p.Senha, &p.Ativo)
	if errors.Is(err, pgx.ErrNoRows) {
		return p, ErrNotFound
	}
	return p, err
}

func GetDoctorByEmail(ctx context.Context, email string) (doctor.Doctor, error) {
	var d doctor.Doctor
	row := pool.QueryRow(ctx,
		`SELECT id, nome, email, telefone, nascimento, cpf, crm, biografia, avaliacao_soma, n_consultas, especialidade, senha, ativo
		 FROM medicos WHERE email = $1`, email)
	err := row.Scan(&d.ID, &d.Nome, &d.Email, &d.Telefone, &d.Nascimento, &d.CPF, &d.CRM, &d.Biografia, &d.AvaliacaoSoma, &d.NConsultas, &d.Especialidade, &d.Senha, &d.Ativo)
	if errors.Is(err, pgx.ErrNoRows) {
		return d, ErrNotFound
	}
	return d, err
}

func GetPatientByID(ctx context.Context, id string) (patient.Patient, error) {
	var p patient.Patient
	row := pool.QueryRow(ctx,
		`SELECT id, nome, email, telefone, nascimento, cpf, senha, ativo FROM pacientes WHERE id = $1`, id)
	err := row.Scan(&p.ID, &p.Nome, &p.Email, &p.Telefone, &p.Nascimento, &p.CPF, &p.Senha, &p.Ativo)
	if errors.Is(err, pgx.ErrNoRows) {
		return p, ErrNotFound
	}
	return p, err
}

func GetDoctorByID(ctx context.Context, id string) (doctor.Doctor, error) {
	var d doctor.Doctor
	row := pool.QueryRow(ctx,
		`SELECT id, nome, email, telefone, nascimento, cpf, crm, biografia, avaliacao_soma, n_consultas, especialidade, senha, ativo
		 FROM medicos WHERE id = $1`, id)
	err := row.Scan(&d.ID, &d.Nome, &d.Email, &d.Telefone, &d.Nascimento, &d.CPF, &d.CRM, &d.Biografia, &d.AvaliacaoSoma, &d.NConsultas, &d.Especialidade, &d.Senha, &d.Ativo)
	if errors.Is(err, pgx.ErrNoRows) {
		return d, ErrNotFound
	}
	return d, err
}

func ActivatePatient(ctx context.Context, id string) error {
	_, err := pool.Exec(ctx, `UPDATE pacientes SET ativo = TRUE WHERE id = $1`, id)
	return err
}

func ActivateDoctor(ctx context.Context, id string) error {
	_, err := pool.Exec(ctx, `UPDATE medicos SET ativo = TRUE WHERE id = $1`, id)
	return err
}
