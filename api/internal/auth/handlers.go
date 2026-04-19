package auth

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
)

type tokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type refreshReq struct {
	RefreshToken string `json:"refresh_token"`
}

type accessOnly struct {
	AccessToken string `json:"access_token"`
}

// --- Password login ---

type passwordLoginReq struct {
	Identifier string `json:"identifier"`
	Password   string `json:"password"`
}

type passwordLoginResp struct {
	AccessToken        string `json:"access_token"`
	RefreshToken       string `json:"refresh_token"`
	MustChangePassword bool   `json:"must_change_password"`
	Role               string `json:"role"`
}

// HandlePasswordLogin POST /v1/auth/password/login
func (s *Service) HandlePasswordLogin(w http.ResponseWriter, r *http.Request) {
	var req passwordLoginReq
	if err := readJSON(r, &req); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid body")
		return
	}
	res, err := s.LoginWithPassword(r.Context(), req.Identifier, req.Password)
	if err != nil {
		if errors.Is(err, ErrInvalidCredentials) {
			writeErr(w, http.StatusUnauthorized, "invalid credentials")
			return
		}
		writeErr(w, http.StatusInternalServerError, "login failed")
		return
	}
	writeJSON(w, http.StatusOK, passwordLoginResp{
		AccessToken:        res.AccessToken,
		RefreshToken:       res.RefreshToken,
		MustChangePassword: res.MustChangePassword,
		Role:               res.Role,
	})
}

// --- Change password (auth required) ---

type changePasswordReq struct {
	Current string `json:"current_password"`
	New     string `json:"new_password"`
}

// HandleChangePassword POST /v1/auth/password/change
func (s *Service) HandleChangePassword(w http.ResponseWriter, r *http.Request) {
	userID, ok := UserIDFromCtx(r)
	if !ok {
		writeErr(w, http.StatusUnauthorized, "no user in context")
		return
	}
	var req changePasswordReq
	if err := readJSON(r, &req); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid body")
		return
	}
	err := s.ChangePassword(r.Context(), userID, req.Current, req.New)
	switch {
	case errors.Is(err, ErrInvalidCredentials):
		writeErr(w, http.StatusUnauthorized, "current password incorrect")
		return
	case errors.Is(err, ErrWeakPassword):
		writeErr(w, http.StatusBadRequest, "password must be 8+ chars with a letter and a number, and different from current")
		return
	case err != nil:
		writeErr(w, http.StatusInternalServerError, "failed to change password")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// --- Reset request ---

type resetRequestReq struct {
	Email string `json:"email"`
}

// HandleResetRequest POST /v1/auth/password/reset/request
// Always returns 204 to avoid user enumeration.
func (s *Service) HandleResetRequest(w http.ResponseWriter, r *http.Request) {
	var req resetRequestReq
	if err := readJSON(r, &req); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid body")
		return
	}
	_, _ = s.RequestPasswordReset(r.Context(), req.Email) // ignore error intentionally
	w.WriteHeader(http.StatusNoContent)
}

// --- Reset confirm ---

type resetConfirmReq struct {
	Token    string `json:"token"`
	Password string `json:"password"`
}

// HandleResetConfirm POST /v1/auth/password/reset/confirm
func (s *Service) HandleResetConfirm(w http.ResponseWriter, r *http.Request) {
	var req resetConfirmReq
	if err := readJSON(r, &req); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid body")
		return
	}
	err := s.ConfirmPasswordReset(r.Context(), req.Token, req.Password)
	switch {
	case errors.Is(err, ErrResetInvalid):
		writeErr(w, http.StatusUnauthorized, "reset token invalid or expired")
		return
	case errors.Is(err, ErrWeakPassword):
		writeErr(w, http.StatusBadRequest, "password must be 8+ chars with a letter and a number")
		return
	case err != nil:
		writeErr(w, http.StatusInternalServerError, "failed to reset password")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// --- Refresh (unchanged) ---

// HandleRefresh POST /v1/auth/refresh
func (s *Service) HandleRefresh(w http.ResponseWriter, r *http.Request) {
	var req refreshReq
	if err := readJSON(r, &req); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid body")
		return
	}
	claims, err := s.issuer.Verify(req.RefreshToken)
	if err != nil || claims.Kind != "refresh" {
		writeErr(w, http.StatusUnauthorized, "invalid refresh token")
		return
	}
	access, err := s.issuer.IssueAccess(claims.UserID, claims.Role, claims.Phone)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "token issue failed")
		return
	}
	writeJSON(w, http.StatusOK, accessOnly{AccessToken: access})
}

// HandleMe GET /v1/me (auth required)
func (s *Service) HandleMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := UserIDFromCtx(r)
	if !ok {
		writeErr(w, http.StatusUnauthorized, "no user in context")
		return
	}
	user, err := s.LoadUser(r.Context(), userID)
	if err != nil {
		writeErr(w, http.StatusNotFound, "user not found")
		return
	}
	writeJSON(w, http.StatusOK, user)
}

// --- Admin: create user ---

type adminCreateUserReq struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
	Role  string `json:"role"`
}

// HandleAdminCreateUser POST /v1/admin/users (admin only; enforced by route middleware)
func (s *Service) HandleAdminCreateUser(w http.ResponseWriter, r *http.Request) {
	var req adminCreateUserReq
	if err := readJSON(r, &req); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid body")
		return
	}
	res, err := s.CreateUserWithDefaultPassword(r.Context(), CreateUserInput{
		Name:  req.Name,
		Email: req.Email,
		Phone: req.Phone,
		Role:  req.Role,
	})
	if err != nil {
		msg := err.Error()
		// Surface uniqueness violations as 409; everything else 400.
		if isUniqueViolation(err) {
			writeErr(w, http.StatusConflict, "email or phone already in use")
			return
		}
		writeErr(w, http.StatusBadRequest, msg)
		return
	}
	writeJSON(w, http.StatusCreated, res)
}

// isUniqueViolation does a crude substring check so we don't drag in pgconn
// from an unrelated package.
func isUniqueViolation(err error) bool {
	if err == nil {
		return false
	}
	msg := err.Error()
	return containsAny(msg, "duplicate key", "unique constraint", "users_email_unique", "users_phone_key")
}

func containsAny(s string, needles ...string) bool {
	for _, n := range needles {
		for i := 0; i+len(n) <= len(s); i++ {
			if s[i:i+len(n)] == n {
				return true
			}
		}
	}
	return false
}

func readJSON(r *http.Request, v any) error {
	defer r.Body.Close()
	body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil {
		return err
	}
	return json.Unmarshal(body, v)
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
