package payment

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/viktheatre/api/internal/platform/razorpay"
)

// fakeStore implements Store in-memory for tests.
type fakeStore struct {
	payments map[string]*Payment // keyed by razorpay_order_id
}

func newFakeStore() *fakeStore {
	return &fakeStore{payments: make(map[string]*Payment)}
}

func (f *fakeStore) InsertPayment(_ context.Context, p Payment) error {
	f.payments[p.RazorpayOrderID] = &p
	return nil
}

func (f *fakeStore) UpdateStatus(_ context.Context, razorpayOrderID, status string) error {
	if p, ok := f.payments[razorpayOrderID]; ok {
		p.Status = status
	}
	return nil
}

func (f *fakeStore) ListByUser(_ context.Context, userID uuid.UUID) ([]Payment, error) {
	var out []Payment
	for _, p := range f.payments {
		if p.UserID == userID {
			out = append(out, *p)
		}
	}
	return out, nil
}

func (f *fakeStore) GetPendingDue(_ context.Context, userID uuid.UUID) (*PendingDue, error) {
	for _, p := range f.payments {
		if p.UserID == userID && p.Status == "created" {
			return &PendingDue{Period: p.Period, AmountPaise: p.AmountPaise}, nil
		}
	}
	return nil, nil
}

func (f *fakeStore) AuditInsert(_ context.Context, _ uuid.UUID, _, _ string, _ map[string]any) error {
	return nil
}

func TestCreateFeeOrder_Stub(t *testing.T) {
	store := newFakeStore()
	rp := razorpay.New(razorpay.Config{}) // stub mode
	svc := New(store, rp)

	userID := uuid.New()
	orderID, keyID, err := svc.CreateFeeOrder(context.Background(), userID, "2026-05", 450000)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if orderID == "" {
		t.Fatal("expected non-empty order ID")
	}
	if keyID != "rzp_test_stub" {
		t.Fatalf("expected stub key ID, got %q", keyID)
	}

	// Verify payment row was inserted.
	payments, _ := store.ListByUser(context.Background(), userID)
	if len(payments) != 1 {
		t.Fatalf("expected 1 payment, got %d", len(payments))
	}
	if payments[0].Status != "created" {
		t.Fatalf("expected status=created, got %q", payments[0].Status)
	}
}

func TestHandleWebhook_PaymentCaptured(t *testing.T) {
	store := newFakeStore()
	rp := razorpay.New(razorpay.Config{}) // stub
	svc := New(store, rp)

	// Simulate an existing order.
	userID := uuid.New()
	orderID, _, _ := svc.CreateFeeOrder(context.Background(), userID, "2026-05", 450000)

	// Simulate webhook.
	event := RazorpayEvent{
		Event: "payment.captured",
		Payload: PayloadWrapper{
			Payment: PaymentEntity{
				Entity: PaymentEntityInner{
					ID:      "pay_test_123",
					OrderID: orderID,
					Amount:  450000,
					Status:  "captured",
				},
			},
		},
	}

	if err := svc.HandleWebhook(context.Background(), event); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Verify status flipped.
	p := store.payments[orderID]
	if p.Status != "paid" {
		t.Fatalf("expected status=paid, got %q", p.Status)
	}
}
