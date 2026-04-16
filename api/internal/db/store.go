package db

import "github.com/jackc/pgx/v5/pgxpool"

// Store wraps the pgx pool. When sqlc is run (`make sqlc-gen`), the generated
// dbq.Queries should be embedded here so service code can call typed queries.
// TODO: run `sqlc generate` and embed *dbq.Queries.
type Store struct {
	Pool *pgxpool.Pool
}

func NewStore(p *pgxpool.Pool) *Store {
	return &Store{Pool: p}
}
