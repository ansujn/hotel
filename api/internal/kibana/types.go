package kibana

import (
	"time"

	"github.com/google/uuid"
)

// KibanaID is the well-known restaurants.id row that represents Kibana
// Jaipur. Single-restaurant deployment uses this constant; the multi-
// restaurant tables stay as-is so we can grow into a chain later.
const KibanaID = "11111111-1111-1111-1111-111111111101"

// BanquetHall is one venue space within Kibana.
type BanquetHall struct {
	ID            uuid.UUID `json:"id"`
	Name          string    `json:"name"`
	Description   *string   `json:"description,omitempty"`
	CapacityMin   int       `json:"capacity_min"`
	CapacityMax   int       `json:"capacity_max"`
	PricePerPlate int       `json:"price_per_plate"`
	HireCharge    int       `json:"hire_charge"`
	Features      []string  `json:"features"`
	HeroImageURL  *string   `json:"hero_image_url,omitempty"`
	Images        []string  `json:"images"`
	SortOrder     int       `json:"sort_order"`
}

// MenuCategory is a menu section.
type MenuCategory struct {
	ID          uuid.UUID  `json:"id"`
	Name        string     `json:"name"`
	Description *string    `json:"description,omitempty"`
	SortOrder   int        `json:"sort_order"`
	Items       []MenuItem `json:"items"`
}

// MenuItem is a single menu entry.
type MenuItem struct {
	ID          uuid.UUID `json:"id"`
	CategoryID  uuid.UUID `json:"category_id"`
	Name        string    `json:"name"`
	Description *string   `json:"description,omitempty"`
	Price       int       `json:"price"`
	IsVeg       bool      `json:"is_veg"`
	IsSignature bool      `json:"is_signature"`
	SpiceLevel  int       `json:"spice_level"`
	ImageURL    *string   `json:"image_url,omitempty"`
	SortOrder   int       `json:"sort_order"`
}

// CreateBookingReq is the JSON body for POST /v1/bookings.
type CreateBookingReq struct {
	BanquetHallID       *uuid.UUID `json:"banquet_hall_id,omitempty"`
	EventType           string     `json:"event_type"`
	GuestCount          int        `json:"guest_count"`
	EventDate           string     `json:"event_date"` // YYYY-MM-DD
	StartTime           string     `json:"start_time"` // HH:MM
	DurationMinutes     int        `json:"duration_minutes"`
	CuisinePreference   []string   `json:"cuisine_preference,omitempty"`
	DietaryRestrictions []string   `json:"dietary_restrictions,omitempty"`
	BudgetPerPlate      *int       `json:"budget_per_plate,omitempty"`
	SpecialRequests     *string    `json:"special_requests,omitempty"`
	ContactName         string     `json:"contact_name"`
	ContactPhone        string     `json:"contact_phone"`
	ContactEmail        string     `json:"contact_email"`
}

// Booking is a stored event booking.
type Booking struct {
	ID                  uuid.UUID  `json:"id"`
	BanquetHallID       *uuid.UUID `json:"banquet_hall_id,omitempty"`
	EventType           string     `json:"event_type"`
	GuestCount          int        `json:"guest_count"`
	EventDate           string     `json:"event_date"`
	StartTime           string     `json:"start_time"`
	DurationMinutes     int        `json:"duration_minutes"`
	CuisinePreference   []string   `json:"cuisine_preference"`
	DietaryRestrictions []string   `json:"dietary_restrictions"`
	BudgetPerPlate      *int       `json:"budget_per_plate,omitempty"`
	SpecialRequests     *string    `json:"special_requests,omitempty"`
	ContactName         string     `json:"contact_name"`
	ContactPhone        string     `json:"contact_phone"`
	ContactEmail        string     `json:"contact_email"`
	Status              string     `json:"status"`
	CreatedAt           time.Time  `json:"created_at"`
}
