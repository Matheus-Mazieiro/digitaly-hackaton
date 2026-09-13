APP_NAME=digitaly-hackaton
CMD_PATH=./cmd/server
SCRIPT=db-setup-linux.sh

.PHONY: run build clean test fmt lint dev

run:
	go run $(CMD_PATH)

build:
	go build -o bin/$(APP_NAME) $(CMD_PATH)

clean:
	rm -rf bin/

test:
	go test ./...

fmt:
	go fmt ./...

lint:
	golangci-lint run

dev:
	air

# --- Banco de dados (Postgres local, sem Docker) ---
.PHONY: db-setup db-psql db-reset

db-setup:
	bash scripts/$(SCRIPT)

db-psql:
	/opt/homebrew/opt/postgresql@18/bin/psql -d digitaly

db-reset:
	/opt/homebrew/opt/postgresql@18/bin/psql -d postgres -c "DROP DATABASE IF EXISTS digitaly;"
	bash scripts/$(SCRIPT)
