package payment

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/google/uuid"
	"github.com/viktheatre/api/internal/auth"
)

// HandleCreateOrder handles POST /v1/payments/order.
func (s *Service) HandleCreateOrder(w http.ResponseWriter, r *http.Request) {
	userID, ok := userUUID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	var req CreateOrderReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid body"})
		return
	}
	if req.Period == "" || req.AmountPaise <= 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "period and amount_paise required"})
		return
	}

	orderID, keyID, err := s.CreateFeeOrder(r.Context(), userID, req.Period, req.AmountPaise)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "order creation failed"})
		return
	}

	writeJSON(w, http.StatusOK, CreateOrderRes{
		OrderID:       orderID,
		RazorpayKeyID: keyID,
		AmountPaise:   req.AmountPaise,
	})
}

// HandleWebhookHTTP handles POST /v1/webhooks/razorpay.
func (s *Service) HandleWebhookHTTP(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "read body"})
		return
	}

	sig := r.Header.Get("X-Razorpay-Signature")
	if !s.rp.VerifyWebhookSignature(body, sig) {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid signature"})
		return
	}

	var event RazorpayEvent
	if err := json.Unmarshal(body, &event); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}

	if err := s.HandleWebhook(r.Context(), event); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "webhook processing failed"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// HandleListPayments handles GET /v1/payments.
func (s *Service) HandleListPayments(w http.ResponseWriter, r *http.Request) {
	userID, ok := userUUID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	payments, err := s.ListPayments(r.Context(), userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "fetch failed"})
		return
	}
	if payments == nil {
		payments = []Payment{}
	}
	writeJSON(w, http.StatusOK, payments)
}

// HandleGetDues handles GET /v1/payments/dues.
func (s *Service) HandleGetDues(w http.ResponseWriter, r *http.Request) {
	userID, ok := userUUID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	due, err := s.GetPendingDues(r.Context(), userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "fetch failed"})
		return
	}
	if due == nil {
		writeJSON(w, http.StatusOK, map[string]any{"pending": false})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"pending":      true,
		"period":       due.Period,
		"amount_paise": due.AmountPaise,
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func userUUID(r *http.Request) (uuid.UUID, bool) {
	s, ok := auth.UserIDFromCtx(r)
	if !ok {
		return uuid.Nil, false
	}
	id, err := uuid.Parse(s)
	if err != nil {
		return uuid.Nil, false
	}
	return id, true
}
