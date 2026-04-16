package progress

import (
	"context"
	"encoding/json"
	"math"

	"github.com/jackc/pgx/v5/pgxpool"
)

// PGStore is the pgx-backed implementation of Store.
type PGStore struct{ pool *pgxpool.Pool }

// NewPGStore creates a new PGStore.
func NewPGStore(pool *pgxpool.Pool) *PGStore { return &PGStore{pool: pool} }

func (s *PGStore) RubricAverageForStudent(ctx context.Context, studentID string) ([]DimScore, error) {
	const q = `
		SELECT r.dimension, AVG(r.score)::float AS avg_score
		FROM rubric_scores r
		JOIN assets a ON a.id = r.asset_id
		WHERE a.student_id = $1
		GROUP BY r.dimension
		ORDER BY r.dimension
	`
	rows, err := s.pool.Query(ctx, q, studentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []DimScore
	for rows.Next() {
		var d DimScore
		var avg float64
		if err := rows.Scan(&d.Dimension, &avg); err != nil {
			return nil, err
		}
		d.Score = int(math.Round(avg))
		out = append(out, d)
	}
	return out, rows.Err()
}

func (s *PGStore) TimelineForStudent(ctx context.Context, studentID string) ([]Assessment, error) {
	const q = `
		SELECT a.id::text, a.title, a.created_at,
		       COALESCE(
		         (SELECT json_agg(json_build_object('dimension', r.dimension, 'score', r.score))
		          FROM rubric_scores r WHERE r.asset_id = a.id), '[]'
		       ) AS scores,
		       COALESCE(
		         (SELECT n.body FROM notes n WHERE n.asset_id = a.id AND n.private = FALSE
		          ORDER BY n.created_at DESC LIMIT 1), ''
		       ) AS note
		FROM assets a
		WHERE a.student_id = $1
		  AND EXISTS (SELECT 1 FROM rubric_scores r WHERE r.asset_id = a.id)
		ORDER BY a.created_at DESC
	`
	rows, err := s.pool.Query(ctx, q, studentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []Assessment
	for rows.Next() {
		var assess Assessment
		var scoresJSON []byte
		if err := rows.Scan(&assess.AssetID, &assess.AssetTitle, &assess.Date, &scoresJSON, &assess.Note); err != nil {
			return nil, err
		}
		var rawScores []DimScore
		_ = json.Unmarshal(scoresJSON, &rawScores)
		assess.Scores = rawScores
		out = append(out, assess)
	}
	return out, rows.Err()
}

func (s *PGStore) UpsertRubric(ctx context.Context, assetID, instructorID string, scores map[string]int) error {
	const q = `INSERT INTO rubric_scores (asset_id, dimension, score, instructor_id) VALUES ($1, $2, $3, $4)`
	for dim, score := range scores {
		if _, err := s.pool.Exec(ctx, q, assetID, dim, score, instructorID); err != nil {
			return err
		}
	}
	return nil
}

func (s *PGStore) RubricForAsset(ctx context.Context, assetID string) ([]RubricScore, error) {
	const q = `
		SELECT id::text, asset_id::text, dimension, score, instructor_id::text, scored_at
		FROM rubric_scores
		WHERE asset_id = $1
		ORDER BY scored_at DESC
	`
	rows, err := s.pool.Query(ctx, q, assetID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []RubricScore
	for rows.Next() {
		var r RubricScore
		if err := rows.Scan(&r.ID, &r.AssetID, &r.Dimension, &r.Score, &r.InstructorID, &r.ScoredAt); err != nil {
			return nil, err
		}
		out = append(out, r)
	}
	return out, rows.Err()
}

func (s *PGStore) CreateNote(ctx context.Context, assetID, authorID, body string, private bool) (*Note, error) {
	const q = `
		INSERT INTO notes (asset_id, author_id, body, private)
		VALUES ($1, $2, $3, $4)
		RETURNING id::text, asset_id::text, author_id::text, body, private, created_at
	`
	n := &Note{}
	err := s.pool.QueryRow(ctx, q, assetID, authorID, body, private).Scan(
		&n.ID, &n.AssetID, &n.AuthorID, &n.Body, &n.Private, &n.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return n, nil
}

func (s *PGStore) ListNotes(ctx context.Context, assetID string, includePrivate bool) ([]Note, error) {
	q := `
		SELECT id::text, asset_id::text, author_id::text, body, private, created_at
		FROM notes
		WHERE asset_id = $1
	`
	if !includePrivate {
		q += ` AND private = FALSE`
	}
	q += ` ORDER BY created_at DESC`
	rows, err := s.pool.Query(ctx, q, assetID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []Note
	for rows.Next() {
		var n Note
		if err := rows.Scan(&n.ID, &n.AssetID, &n.AuthorID, &n.Body, &n.Private, &n.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, n)
	}
	return out, rows.Err()
}
