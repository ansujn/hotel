package auth

import (
	"context"
	"net/http"
)

func withUser(ctx context.Context, userID, role, phone string) context.Context {
	ctx = context.WithValue(ctx, ctxKeyUserID, userID)
	ctx = context.WithValue(ctx, ctxKeyRole, role)
	ctx = context.WithValue(ctx, ctxKeyPhone, phone)
	return ctx
}

// RequireRole returns middleware that enforces the context role is one of the
// allowed roles. Must run AFTER RequireAuth.
func (s *Service) RequireRole(roles ...string) func(http.Handler) http.Handler {
	allowed := make(map[string]struct{}, len(roles))
	for _, r := range roles {
		allowed[r] = struct{}{}
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role, ok := RoleFromCtx(r)
			if !ok {
				writeErr(w, http.StatusUnauthorized, "missing role")
				return
			}
			if _, found := allowed[role]; !found {
				writeErr(w, http.StatusForbidden, "role not permitted")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// OptionalAuth validates the bearer token if present, otherwise lets the
// request proceed anonymously. Handlers use RoleFromCtx / UserIDFromCtx to
// branch on whether a user is attached.
func (s *Service) OptionalAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		header := r.Header.Get("Authorization")
		if len(header) < 8 || header[:7] != "Bearer " {
			next.ServeHTTP(w, r)
			return
		}
		tokenStr := header[7:]
		claims, err := s.issuer.Verify(tokenStr)
		if err != nil || claims.Kind != "access" {
			next.ServeHTTP(w, r)
			return
		}
		ctx := r.Context()
		ctx = withUser(ctx, claims.UserID, claims.Role, claims.Phone)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
