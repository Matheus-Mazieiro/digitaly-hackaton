APP_NAME=digitaly-hackaton
CMD_PATH=./cmd/server

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