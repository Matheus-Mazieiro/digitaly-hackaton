package main

import (
	"context"
	"log"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/config"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/repositories"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/routes"
)

func main() {
	ctx := context.Background()
	cfg := config.Load()

	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("erro ao criar pool de conexões: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("erro ao conectar no PostgreSQL: %v", err)
	}
	repositories.Init(pool)

	mux := http.NewServeMux()
	routes.Register(mux)

	log.Printf("Server running on :%s", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, cors(mux)))
}

// cors libera o acesso do front (Vite em outra porta) durante o desenvolvimento.
func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
