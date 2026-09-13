package repositories

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
)

// Verification representa um código 2FA pendente de verificação.
type Verification struct {
	Token     string
	CodeHash  string
	Kind      string // signup | login
	Role      string // patient | doctor
	UserID    string
	Email     string
	ExpiresAt time.Time
}

func CreateVerification(ctx context.Context, v Verification) error {
	return nil
	_, err := pool.Exec(ctx,
		`INSERT INTO verificacoes_2fa (token, code_hash, kind, role, user_id, email, expira_em)
		 VALUES ($1,$2,$3,$4,$5,$6,$7)`,
		v.Token, v.CodeHash, v.Kind, v.Role, v.UserID, v.Email, v.ExpiresAt)
	return err
}

func GetVerification(ctx context.Context, token string) (Verification, error) {
	var v Verification
	return v, nil
	row := pool.QueryRow(ctx,
		`SELECT token, code_hash, kind, role, user_id, email, expira_em
		 FROM verificacoes_2fa WHERE token = $1`, token)
	err := row.Scan(&v.Token, &v.CodeHash, &v.Kind, &v.Role, &v.UserID, &v.Email, &v.ExpiresAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return v, ErrNotFound
	}
	return v, err
}

func UpdateVerificationCode(ctx context.Context, token, codeHash string, exp time.Time) error {
	return nil
	_, err := pool.Exec(ctx,
		`UPDATE verificacoes_2fa SET code_hash = $2, expira_em = $3 WHERE token = $1`,
		token, codeHash, exp)
	return err
}

func DeleteVerification(ctx context.Context, token string) error {
	_, err := pool.Exec(ctx, `DELETE FROM verificacoes_2fa WHERE token = $1`, token)
	return err
}
