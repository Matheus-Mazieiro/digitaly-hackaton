package auth

import (
	"context"
	"net/http"
	"strings"
)

type ctxKey string

const (
	CtxUserID ctxKey = "userID"
	CtxRole   ctxKey = "role"
)

// Middleware valida o Bearer token e injeta userID/role no contexto.
func Middleware(secret string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authz := r.Header.Get("Authorization")
		if !strings.HasPrefix(authz, "Bearer ") {
			http.Error(w, "não autorizado", http.StatusUnauthorized)
			return
		}
		claims, err := ParseToken(strings.TrimPrefix(authz, "Bearer "), secret)
		if err != nil {
			http.Error(w, "não autorizado", http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), CtxUserID, claims.UserID)
		ctx = context.WithValue(ctx, CtxRole, claims.Role)
		next(w, r.WithContext(ctx))
	}
}

func UserID(ctx context.Context) string {
	s, _ := ctx.Value(CtxUserID).(string)
	return s
}

func Role(ctx context.Context) string {
	s, _ := ctx.Value(CtxRole).(string)
	return s
}
