package config

import "os"

// Config agrega as variáveis de ambiente da aplicação.
type Config struct {
	Port        string
	DatabaseURL string
	OpenAIKey   string
	EmailFrom   string
}

// Load lê o ambiente e aplica defaults de desenvolvimento.
func Load() Config {
	return Config{
		Port:        getenv("PORT", "8080"),
		DatabaseURL: getenv("DATABASE_URL", "postgres://digitaly:digitaly@localhost:5432/digitaly"),
		OpenAIKey:   os.Getenv("OPENAI_API_KEY"),
		EmailFrom:   getenv("EMAIL_FROM", "no-reply@digitalyhub.com"),
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
