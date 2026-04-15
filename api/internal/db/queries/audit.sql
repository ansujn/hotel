-- name: AuditInsert :exec
INSERT INTO audit_log (actor_id, action, target, meta)
VALUES ($1, $2, $3, $4);
