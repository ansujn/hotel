-- name: AssetCreate :one
INSERT INTO assets (student_id, type, title)
VALUES ($1, $2, $3)
RETURNING id, student_id, type, title, mux_asset_id, mux_playback_id, duration_s, privacy, created_at;

-- name: AssetGetByID :one
SELECT id, student_id, type, title, mux_asset_id, mux_playback_id, duration_s, privacy, created_at
FROM assets
WHERE id = $1;

-- name: AssetListForStudent :many
SELECT id, student_id, type, title, mux_asset_id, mux_playback_id, duration_s, privacy, created_at
FROM assets
WHERE student_id = $1
  AND (sqlc.narg('privacy')::asset_privacy IS NULL OR privacy = sqlc.narg('privacy')::asset_privacy)
ORDER BY created_at DESC;

-- name: AssetListPublicForStudent :many
SELECT id, student_id, type, title, mux_asset_id, mux_playback_id, duration_s, privacy, created_at
FROM assets
WHERE student_id = $1 AND privacy = 'public'
ORDER BY created_at DESC;

-- name: AssetSetMuxIDs :exec
UPDATE assets
SET mux_asset_id = $2,
    mux_playback_id = $3,
    duration_s = $4
WHERE id = $1;

-- name: AssetUpdatePrivacy :exec
UPDATE assets
SET privacy = $2
WHERE id = $1;
