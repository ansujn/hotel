-- name: ConsentCreate :one
INSERT INTO consents (
  asset_id, parent_id, scope_channel, scope_social, scope_print,
  signed_name, signed_ip, signed_ua, pdf_url, valid_until
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING id, asset_id, parent_id, scope_channel, scope_social, scope_print,
          signed_name, signed_ip, signed_ua, pdf_url, valid_until, signed_at, revoked_at;

-- name: ConsentGetLatestForAsset :one
SELECT id, asset_id, parent_id, scope_channel, scope_social, scope_print,
       signed_name, signed_ip, signed_ua, pdf_url, valid_until, signed_at, revoked_at
FROM consents
WHERE asset_id = $1 AND revoked_at IS NULL
ORDER BY signed_at DESC
LIMIT 1;

-- name: ConsentRevoke :exec
UPDATE consents
SET revoked_at = NOW()
WHERE id = $1;
