-- name: BatchCreate :one
INSERT INTO batches (name, track, schedule, instructor_id)
VALUES ($1, $2, $3, $4)
RETURNING id, name, track, schedule, instructor_id, created_at;

-- name: BatchGetByID :one
SELECT id, name, track, schedule, instructor_id, created_at
FROM batches
WHERE id = $1;

-- name: BatchListForInstructor :many
SELECT id, name, track, schedule, instructor_id, created_at
FROM batches
WHERE instructor_id = $1
ORDER BY created_at DESC;

-- name: EnrollmentCreate :exec
INSERT INTO enrollments (batch_id, student_id, status)
VALUES ($1, $2, COALESCE($3, 'active'))
ON CONFLICT (batch_id, student_id) DO NOTHING;

-- name: EnrollmentListByBatch :many
SELECT batch_id, student_id, joined_at, status
FROM enrollments
WHERE batch_id = $1
ORDER BY joined_at ASC;
