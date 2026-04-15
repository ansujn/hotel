package auth

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
)

type otpSendReq struct {
	Phone string `json:"phone"`
}

type otpVerifyReq struct {
	Phone string `json:"phone"`
	Code  string `json:"code"`
}

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

// HandleOTPSend POST /v1/auth/otp/send
func (s *Service) HandleOTPSend(w http.ResponseWriter, r *http.Request) {
	var req otpSendReq
	if err := readJSON(r, &req); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid body")
		return
	}
	if err := s.SendOTP(r.Context(), req.Phone); err != nil {
		writeErr(w, http.StatusBadGateway, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// HandleOTPVerify POST /v1/auth/otp/verify
func (s *Service) HandleOTPVerify(w http.ResponseWriter, r *http.Request) {
	var req otpVerifyReq
	if err := readJSON(r, &req); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid body")
		return
	}
	userID, role, err := s.VerifyOTP(r.Context(), req.Phone, req.Code)
	if err != nil {
		if errors.Is(err, ErrInvalidOTP) {
			writeErr(w, http.StatusUnauthorized, "invalid otp")
			return
		}
		writeErr(w, http.StatusBadGateway, err.Error())
		return
	}
	access, err := s.issuer.IssueAccess(userID, role, req.Phone)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "token issue failed")
		return
	}
	refresh, err := s.issuer.IssueRefresh(userID, role, req.Phone)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "token issue failed")
		return
	}
	writeJSON(w, http.StatusOK, tokenPair{AccessToken: access, RefreshToken: refresh})
}

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
