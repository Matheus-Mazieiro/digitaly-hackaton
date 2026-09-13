package repositories

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
)

// Verification representa um código 2FA/confirmação pendente.
type Verification struct {
	Token     string
	CodeHash  string
	Kind      string // signup | login | appointment
	Role      string // patient | doctor
	UserID    string
	Email     string
	RefID     string // id da consulta (quando kind = appointment)
	ExpiresAt time.Time
}

func CreateVerification(ctx context.Context, v Verification) error {
	_, err := pool.Exec(ctx,
		`INSERT INTO verificacoes_2fa (token, code_hash, kind, role, user_id, email, ref_id, expira_em)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
		v.Token, v.CodeHash, v.Kind, v.Role, v.UserID, v.Email, v.RefID, v.ExpiresAt)
	return err
}

func GetVerification(ctx context.Context, token string) (Verification, error) {
	var v Verification
	row := pool.QueryRow(ctx,
		`SELECT token, code_hash, kind, role, user_id, email, COALESCE(ref_id,''), expira_em
		 FROM verificacoes_2fa WHERE token = $1`, token)
	err := row.Scan(&v.Token, &v.CodeHash, &v.Kind, &v.Role, &v.UserID, &v.Email, &v.RefID, &v.ExpiresAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return v, ErrNotFound
	}
	return v, err
}

func GetVerificationByRef(ctx context.Context, refID, kind string) (Verification, error) {
	var v Verification
	row := pool.QueryRow(ctx,
		`SELECT token, code_hash, kind, role, user_id, email, COALESCE(ref_id,''), expira_em
		 FROM verificacoes_2fa WHERE ref_id = $1 AND kind = $2
		 ORDER BY expira_em DESC LIMIT 1`, refID, kind)
	err := row.Scan(&v.Token, &v.CodeHash, &v.Kind, &v.Role, &v.UserID, &v.Email, &v.RefID, &v.ExpiresAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return v, ErrNotFound
	}
	return v, err
}

func UpdateVerificationCode(ctx context.Context, token, codeHash string, exp time.Time) error {
	_, err := pool.Exec(ctx,
		`UPDATE verificacoes_2fa SET code_hash = $2, expira_em = $3 WHERE token = $1`,
		token, codeHash, exp)
	return err
}

func DeleteVerification(ctx context.Context, token string) error {
	_, err := pool.Exec(ctx, `DELETE FROM verificacoes_2fa WHERE token = $1`, token)
	return err
}
