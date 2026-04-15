package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
)

type ctxKey int

const (
	ctxKeyUserID ctxKey = iota
	ctxKeyRole
	ctxKeyPhone
)

// RequireAuth returns middleware that validates the bearer token and injects
// user identity into the request context.
func (s *Service) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		header := r.Header.Get("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			writeErr(w, http.StatusUnauthorized, "missing bearer token")
			return
		}
		tokenStr := strings.TrimPrefix(header, "Bearer ")
		claims, err := s.issuer.Verify(tokenStr)
		if err != nil {
			writeErr(w, http.StatusUnauthorized, "invalid token")
			return
		}
		if claims.Kind != "access" {
			writeErr(w, http.StatusUnauthorized, "wrong token kind")
			return
		}
		ctx := context.WithValue(r.Context(), ctxKeyUserID, claims.UserID)
		ctx = context.WithValue(ctx, ctxKeyRole, claims.Role)
		ctx = context.WithValue(ctx, ctxKeyPhone, claims.Phone)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// UserIDFromCtx extracts the authenticated user id.
func UserIDFromCtx(r *http.Request) (string, bool) {
	v, ok := r.Context().Value(ctxKeyUserID).(string)
	return v, ok
}

// RoleFromCtx extracts the authenticated user's role.
func RoleFromCtx(r *http.Request) (string, bool) {
	v, ok := r.Context().Value(ctxKeyRole).(string)
	return v, ok
}

func writeErr(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": msg})
}
