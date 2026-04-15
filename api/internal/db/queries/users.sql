-- name: UserGetByID :one
SELECT id, phone, email, name, avatar_url, role, locale, created_at
FROM users
WHERE id = $1;

-- name: UserGetByPhone :one
SELECT id, phone, email, name, avatar_url, role, locale, created_at
FROM users
WHERE phone = $1;

-- name: UserUpsertByPhone :one
INSERT INTO users (phone, role)
VALUES ($1, 'student')
ON CONFLICT (phone) DO UPDATE SET phone = EXCLUDED.phone
RETURNING id, phone, email, name, avatar_url, role, locale, created_at;

-- name: UserUpdateProfile :exec
UPDATE users
SET name = COALESCE($2, name),
    email = COALESCE($3, email),
    avatar_url = COALESCE($4, avatar_url),
    locale = COALESCE($5, locale)
WHERE id = $1;

-- name: UserGetByIDs :many
SELECT id, phone, email, name, avatar_url, role, locale, created_at
FROM users
WHERE id = ANY($1::uuid[]);
