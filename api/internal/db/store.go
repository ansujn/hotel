package db

// TODO: run sqlc generate — the dbq package below is produced by `make sqlc-gen`.
import (
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/viktheatre/api/internal/db/dbq"
)

// Store wraps the pgx pool and the sqlc-generated Queries so service code
// can call typed queries and, when it needs a transaction, grab the Pool
// directly and build a per-tx *dbq.Queries via dbq.New(tx).
type Store struct {
	Pool *pgxpool.Pool
	*dbq.Queries
}

func NewStore(p *pgxpool.Pool) *Store {
	return &Store{Pool: p, Queries: dbq.New(p)}
}
