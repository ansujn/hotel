package payment

import (
	"time"

	"github.com/google/uuid"
)

// Payment represents a fee payment record.
type Payment struct {
	ID              uuid.UUID `json:"id"`
	UserID          uuid.UUID `json:"user_id"`
	RazorpayOrderID string    `json:"razorpay_order_id"`
	AmountPaise     int64     `json:"amount_paise"`
	Status          string    `json:"status"` // created, paid, failed
	Period          string    `json:"period"` // e.g. "2026-05", "2026-06"
	CreatedAt       time.Time `json:"created_at"`
}

// PendingDue represents the next unpaid invoice for a user.
type PendingDue struct {
	Period      string `json:"period"`
	AmountPaise int64  `json:"amount_paise"`
}

// CreateOrderReq is the JSON body for POST /v1/payments/order.
type CreateOrderReq struct {
	Period      string `json:"period"`
	AmountPaise int64  `json:"amount_paise"`
}

// CreateOrderRes is the response for POST /v1/payments/order.
type CreateOrderRes struct {
	OrderID       string `json:"order_id"`
	RazorpayKeyID string `json:"razorpay_key_id"`
	AmountPaise   int64  `json:"amount_paise"`
}

// RazorpayEvent is the top-level webhook payload from Razorpay.
type RazorpayEvent struct {
	Event   string          `json:"event"`
	Payload PayloadWrapper  `json:"payload"`
}

// PayloadWrapper wraps the payment entity in the webhook.
type PayloadWrapper struct {
	Payment PaymentEntity `json:"payment"`
}

// PaymentEntity is the payment object inside a webhook payload.
type PaymentEntity struct {
	Entity PaymentEntityInner `json:"entity"`
}

// PaymentEntityInner holds the fields we care about from Razorpay.
type PaymentEntityInner struct {
	ID      string `json:"id"`
	OrderID string `json:"order_id"`
	Amount  int64  `json:"amount"`
	Status  string `json:"status"` // captured, failed, etc.
}
