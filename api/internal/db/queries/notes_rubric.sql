-- name: RubricUpsert :exec
INSERT INTO rubric_scores (asset_id, dimension, score, instructor_id)
VALUES ($1, $2, $3, $4);

-- name: RubricListForAsset :many
SELECT id, asset_id, dimension, score, instructor_id, scored_at
FROM rubric_scores
WHERE asset_id = $1
ORDER BY scored_at DESC;

-- name: RubricAverageForStudent :many
SELECT r.dimension, AVG(r.score)::float AS avg_score, COUNT(*)::int AS n
FROM rubric_scores r
JOIN assets a ON a.id = r.asset_id
WHERE a.student_id = $1
GROUP BY r.dimension
ORDER BY r.dimension;

-- name: NoteCreate :one
INSERT INTO notes (asset_id, author_id, body, private)
VALUES ($1, $2, $3, $4)
RETURNING id, asset_id, author_id, body, private, created_at;

-- name: NoteListForAsset :many
SELECT id, asset_id, author_id, body, private, created_at
FROM notes
WHERE asset_id = $1
  AND (sqlc.narg('include_private')::bool IS TRUE OR private = FALSE)
ORDER BY created_at DESC;
