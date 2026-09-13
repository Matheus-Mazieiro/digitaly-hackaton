package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/config"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/repositories"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/routes"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/services"
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
	services.InitAuth(cfg)

	if os.Getenv("API_TOKEN") == "" {
		log.Println("AVISO: API_TOKEN não está definido — endpoints de IA vão falhar")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8085"
	}

	mux := http.NewServeMux()
	routes.Register(mux, cfg)

	handler := corsMiddleware(mux)

	log.Printf("Server running on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

// corsMiddleware libera o frontend (Vite em :5173) de chamar o backend.
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		w.Header().Set("Access-Control-Max-Age", "86400")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
