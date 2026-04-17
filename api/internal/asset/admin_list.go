package asset

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// AdminStudentRow is one row in GET /v1/admin/students.
type AdminStudentRow struct {
	ID            string     `json:"id"`
	Name          string     `json:"name"`
	Phone         string     `json:"phone"`
	BatchName     string     `json:"batch_name"`
	ParentName    string     `json:"parent_name"`
	AssetCount    int        `json:"asset_count"`
	ConsentStatus string     `json:"consent_status"` // none | pending | signed
	LastActive    *time.Time `json:"last_active,omitempty"`
}

// AdminHandler is a plain http.Handler (not on *Service) so it doesn't
// require changes to the Store interface. Takes pool directly.
func AdminListStudentsHandler(pool *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if pool == nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "db unavailable"})
			return
		}
		q := r.URL.Query().Get("q")
		batchID := r.URL.Query().Get("batch")
		rows, err := listStudents(r.Context(), pool, q, batchID)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(rows)
	}
}

func listStudents(ctx context.Context, pool *pgxpool.Pool, q, batchID string) ([]AdminStudentRow, error) {
	const sql = `
SELECT u.id::text, COALESCE(u.name,'') AS name, u.phone,
       COALESCE(b.name,'—') AS batch_name,
       COALESCE((
         SELECT p.name FROM parents_students ps
         JOIN users p ON p.id = ps.parent_id
         WHERE ps.student_id = u.id
         LIMIT 1
       ),'—') AS parent_name,
       COALESCE((SELECT count(*) FROM assets a WHERE a.student_id = u.id), 0)::int AS asset_count,
       CASE
         WHEN EXISTS(SELECT 1 FROM assets a
                     WHERE a.student_id = u.id AND a.privacy = 'public') THEN 'signed'
         WHEN EXISTS(SELECT 1 FROM assets a
                     WHERE a.student_id = u.id AND a.privacy = 'pending_consent') THEN 'pending'
         ELSE 'none'
       END AS consent_status,
       (SELECT max(a.created_at) FROM assets a WHERE a.student_id = u.id) AS last_active
FROM users u
LEFT JOIN enrollments e ON e.student_id = u.id
LEFT JOIN batches b ON b.id = e.batch_id
WHERE u.role = 'student'
  AND ($1 = '' OR u.name ILIKE '%'||$1||'%')
  AND ($2 = '' OR e.batch_id::text = $2)
ORDER BY u.name`
	rows, err := pool.Query(ctx, sql, q, batchID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []AdminStudentRow{}
	for rows.Next() {
		var r AdminStudentRow
		if err := rows.Scan(&r.ID, &r.Name, &r.Phone, &r.BatchName, &r.ParentName,
			&r.AssetCount, &r.ConsentStatus, &r.LastActive); err != nil {
			return nil, err
		}
		out = append(out, r)
	}
	return out, rows.Err()
}
