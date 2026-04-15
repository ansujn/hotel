.PHONY: dev build test lint migrate-up migrate-down docker sqlc-gen db-up db-down seed

dev:
	go run ./cmd/server

build:
	CGO_ENABLED=0 go build -o bin/server ./cmd/server

test:
	go test -race -cover ./...

lint:
	golangci-lint run ./...

migrate-up:
	goose -dir migrations postgres "$(DATABASE_URL)" up

migrate-down:
	goose -dir migrations postgres "$(DATABASE_URL)" down

docker:
	docker build -t viktheatre/api:dev .

sqlc-gen:
	sqlc generate

db-up:
	docker compose up -d db

db-down:
	docker compose down

seed:
	psql "$$DATABASE_URL" -f migrations/seed_dev.sql
