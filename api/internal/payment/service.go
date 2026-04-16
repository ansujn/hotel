package payment

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/viktheatre/api/internal/platform/razorpay"
)

// Service handles payment business logic.
type Service struct {
	store  Store
	rp     *razorpay.Client
}

// New creates a payment Service.
func New(store Store, rp *razorpay.Client) *Service {
	return &Service{store: store, rp: rp}
}

// CreateFeeOrder creates a Razorpay order and inserts a payment row.
func (s *Service) CreateFeeOrder(ctx context.Context, userID uuid.UUID, period string, amountPaise int64) (string, string, error) {
	receipt := fmt.Sprintf("fee_%s_%s", userID.String()[:8], period)
	orderID, err := s.rp.CreateOrder(ctx, amountPaise, receipt, map[string]string{
		"user_id": userID.String(),
		"period":  period,
	})
	if err != nil {
		return "", "", fmt.Errorf("create razorpay order: %w", err)
	}

	p := Payment{
		ID:              uuid.New(),
		UserID:          userID,
		RazorpayOrderID: orderID,
		AmountPaise:     amountPaise,
		Status:          "created",
		Period:          period,
		CreatedAt:       time.Now(),
	}
	if err := s.store.InsertPayment(ctx, p); err != nil {
		return "", "", fmt.Errorf("insert payment: %w", err)
	}

	return orderID, s.rp.KeyID(), nil
}

// HandleWebhook processes a Razorpay webhook event.
func (s *Service) HandleWebhook(ctx context.Context, event RazorpayEvent) error {
	if event.Event != "payment.captured" {
		return nil // ignore other events
	}

	orderID := event.Payload.Payment.Entity.OrderID
	if orderID == "" {
		return fmt.Errorf("webhook missing order_id")
	}

	if err := s.store.UpdateStatus(ctx, orderID, "paid"); err != nil {
		return fmt.Errorf("update payment status: %w", err)
	}

	// Best-effort audit log (no user context in webhooks, use zero UUID).
	_ = s.store.AuditInsert(ctx, uuid.Nil, "payment.captured", orderID, nil)
	return nil
}

// ListPayments returns payment history for a user.
func (s *Service) ListPayments(ctx context.Context, userID uuid.UUID) ([]Payment, error) {
	return s.store.ListByUser(ctx, userID)
}

// GetPendingDues returns the next pending due for a user, or nil.
func (s *Service) GetPendingDues(ctx context.Context, userID uuid.UUID) (*PendingDue, error) {
	return s.store.GetPendingDue(ctx, userID)
}
