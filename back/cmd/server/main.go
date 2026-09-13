package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/repositories"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/routes"
)

func main() {
	ctx := context.Background()

	// --- Banco de dados ---
	connString := os.Getenv("DATABASE_URL")
	if connString == "" {
		connString = "postgres://digitaly:digitaly@localhost:5432/digitaly"
	}

	pool, err := pgxpool.New(ctx, connString)
	if err != nil {
		log.Fatalf("erro ao criar pool de conexões: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("erro ao conectar no PostgreSQL: %v", err)
	}
	repositories.Init(pool)

	// --- Aviso se a chave OpenAI não estiver configurada ---
	if os.Getenv("API_TOKEN") == "" {
		log.Println("AVISO: API_TOKEN não está definido — endpoints de IA vão falhar")
	}

	// --- Porta ---
	port := os.Getenv("PORT")
	if port == "" {
		port = "8085"
	}

	// --- Rotas ---
	mux := http.NewServeMux()
	routes.Register(mux)

	// --- Servidor com CORS ---
	handler := corsMiddleware(mux)

	log.Printf("Server running on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

// corsMiddleware libera o frontend (Vite em :5173) de chamar o backend.
// Em produção, troque "*" pelo domínio real.
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		w.Header().Set("Access-Control-Max-Age", "86400")

		// Preflight do browser
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}