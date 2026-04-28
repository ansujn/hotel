package kibana

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Store is the persistence interface for Kibana extras.
type Store interface {
	ListBanquets(ctx context.Context, restaurantID uuid.UUID) ([]BanquetHall, error)
	ListMenu(ctx context.Context, restaurantID uuid.UUID) ([]MenuCategory, error)
	InsertBooking(ctx context.Context, restaurantID uuid.UUID, req CreateBookingReq) (*Booking, error)
}

// PGStore implements Store with pgx.
type PGStore struct {
	pool *pgxpool.Pool
}

// NewPGStore returns a Postgres-backed store.
func NewPGStore(pool *pgxpool.Pool) *PGStore {
	return &PGStore{pool: pool}
}

func (s *PGStore) ListBanquets(ctx context.Context, restaurantID uuid.UUID) ([]BanquetHall, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, name, description, capacity_min, capacity_max, price_per_plate,
		       hire_charge, features, hero_image_url, images, sort_order
		FROM banquet_halls
		WHERE restaurant_id = $1
		ORDER BY sort_order, name`, restaurantID)
	if err != nil {
		return nil, fmt.Errorf("list banquets: %w", err)
	}
	defer rows.Close()

	out := []BanquetHall{}
	for rows.Next() {
		var b BanquetHall
		if err := rows.Scan(&b.ID, &b.Name, &b.Description, &b.CapacityMin,
			&b.CapacityMax, &b.PricePerPlate, &b.HireCharge, &b.Features,
			&b.HeroImageURL, &b.Images, &b.SortOrder); err != nil {
			return nil, err
		}
		if b.Features == nil {
			b.Features = []string{}
		}
		if b.Images == nil {
			b.Images = []string{}
		}
		out = append(out, b)
	}
	return out, rows.Err()
}

func (s *PGStore) ListMenu(ctx context.Context, restaurantID uuid.UUID) ([]MenuCategory, error) {
	// Pull categories first.
	catRows, err := s.pool.Query(ctx, `
		SELECT id, name, description, sort_order
		FROM menu_categories
		WHERE restaurant_id = $1
		ORDER BY sort_order, name`, restaurantID)
	if err != nil {
		return nil, fmt.Errorf("list menu categories: %w", err)
	}
	defer catRows.Close()

	cats := []MenuCategory{}
	idx := map[uuid.UUID]int{}
	for catRows.Next() {
		var c MenuCategory
		if err := catRows.Scan(&c.ID, &c.Name, &c.Description, &c.SortOrder); err != nil {
			return nil, err
		}
		c.Items = []MenuItem{}
		idx[c.ID] = len(cats)
		cats = append(cats, c)
	}
	if err := catRows.Err(); err != nil {
		return nil, err
	}
	if len(cats) == 0 {
		return cats, nil
	}

	itemRows, err := s.pool.Query(ctx, `
		SELECT i.id, i.category_id, i.name, i.description, i.price, i.is_veg,
		       i.is_signature, i.spice_level, i.image_url, i.sort_order
		FROM menu_items i
		JOIN menu_categories c ON c.id = i.category_id
		WHERE c.restaurant_id = $1
		ORDER BY i.sort_order, i.name`, restaurantID)
	if err != nil {
		return nil, fmt.Errorf("list menu items: %w", err)
	}
	defer itemRows.Close()

	for itemRows.Next() {
		var it MenuItem
		if err := itemRows.Scan(&it.ID, &it.CategoryID, &it.Name, &it.Description,
			&it.Price, &it.IsVeg, &it.IsSignature, &it.SpiceLevel, &it.ImageURL,
			&it.SortOrder); err != nil {
			return nil, err
		}
		if pos, ok := idx[it.CategoryID]; ok {
			cats[pos].Items = append(cats[pos].Items, it)
		}
	}
	return cats, itemRows.Err()
}

func (s *PGStore) InsertBooking(ctx context.Context, restaurantID uuid.UUID, req CreateBookingReq) (*Booking, error) {
	cuisine := req.CuisinePreference
	if cuisine == nil {
		cuisine = []string{}
	}
	dietary := req.DietaryRestrictions
	if dietary == nil {
		dietary = []string{}
	}
	b := Booking{
		ID:                  uuid.New(),
		BanquetHallID:       req.BanquetHallID,
		EventType:           req.EventType,
		GuestCount:          req.GuestCount,
		EventDate:           req.EventDate,
		StartTime:           req.StartTime,
		DurationMinutes:     req.DurationMinutes,
		CuisinePreference:   cuisine,
		DietaryRestrictions: dietary,
		BudgetPerPlate:      req.BudgetPerPlate,
		SpecialRequests:     req.SpecialRequests,
		ContactName:         req.ContactName,
		ContactPhone:        req.ContactPhone,
		ContactEmail:        req.ContactEmail,
		Status:              "pending",
		CreatedAt:           time.Now(),
	}
	_, err := s.pool.Exec(ctx, `
		INSERT INTO kibana_bookings (
		  id, restaurant_id, banquet_hall_id, event_type, guest_count,
		  event_date, start_time, duration_minutes, cuisine_preference,
		  dietary_restrictions, budget_per_plate, special_requests,
		  contact_name, contact_phone, contact_email, status, created_at, updated_at
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$17)`,
		b.ID, restaurantID, b.BanquetHallID, b.EventType, b.GuestCount,
		b.EventDate, b.StartTime, b.DurationMinutes, b.CuisinePreference,
		b.DietaryRestrictions, b.BudgetPerPlate, b.SpecialRequests,
		b.ContactName, b.ContactPhone, b.ContactEmail, b.Status, b.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("insert booking: %w", err)
	}
	return &b, nil
}
