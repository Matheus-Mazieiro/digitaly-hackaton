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

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()
	routes.Register(mux)

	log.Printf("Server running on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
