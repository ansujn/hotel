package restaurants

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ErrNotFound is returned when a restaurant/video/image/review row is missing.
var ErrNotFound = errors.New("not found")

// Store is the persistence interface for restaurants.
type Store interface {
	List(ctx context.Context, f ListFilters) (ListResult, error)
	Get(ctx context.Context, id uuid.UUID) (*RestaurantDetail, error)

	ListVideos(ctx context.Context, restaurantID uuid.UUID) ([]VideoItem, error)
	InsertVideo(ctx context.Context, restaurantID uuid.UUID, req CreateVideoReq) (*VideoItem, error)

	ListImages(ctx context.Context, restaurantID uuid.UUID) ([]ImageItem, error)
	InsertImage(ctx context.Context, restaurantID uuid.UUID, req CreateImageReq) (*ImageItem, error)

	ListReviews(ctx context.Context, restaurantID uuid.UUID, page, limit int) (ReviewListResult, error)
	InsertReview(ctx context.Context, req CreateReviewReq, verifyToken string) (*Review, error)
	VerifyReview(ctx context.Context, token string) error
}

// PGStore implements Store with pgx.
type PGStore struct {
	pool *pgxpool.Pool
}

// NewPGStore returns a Postgres-backed Store.
func NewPGStore(pool *pgxpool.Pool) *PGStore {
	return &PGStore{pool: pool}
}

// ----- List/Get restaurants ------------------------------------------------

func (s *PGStore) List(ctx context.Context, f ListFilters) (ListResult, error) {
	if f.Page < 1 {
		f.Page = 1
	}
	if f.Limit < 1 || f.Limit > 100 {
		f.Limit = 20
	}

	args := []any{}
	where := []string{}

	add := func(clause string, val any) {
		args = append(args, val)
		where = append(where, fmt.Sprintf(clause, len(args)))
	}
	if f.Cuisine != "" {
		add("$%d = ANY(cuisines)", f.Cuisine)
	}
	if f.Location != "" {
		add("location ILIKE $%d", "%"+f.Location+"%")
	}
	if f.City != "" {
		add("city ILIKE $%d", f.City)
	}
	if f.MinPrice != nil {
		add("avg_price_per_plate >= $%d", *f.MinPrice)
	}
	if f.MaxPrice != nil {
		add("avg_price_per_plate <= $%d", *f.MaxPrice)
	}
	if f.CapacityMin != nil {
		add("capacity >= $%d", *f.CapacityMin)
	}
	if f.RatingMin != nil {
		add("rating_avg >= $%d", *f.RatingMin)
	}

	whereSQL := ""
	if len(where) > 0 {
		whereSQL = "WHERE " + strings.Join(where, " AND ")
	}

	// Count first.
	var total int
	countSQL := fmt.Sprintf("SELECT COUNT(*) FROM restaurants %s", whereSQL)
	if err := s.pool.QueryRow(ctx, countSQL, args...).Scan(&total); err != nil {
		return ListResult{}, fmt.Errorf("count restaurants: %w", err)
	}

	offset := (f.Page - 1) * f.Limit
	args = append(args, f.Limit, offset)
	listSQL := fmt.Sprintf(`
		SELECT r.id, r.name, r.cuisines, r.location, r.city, r.avg_price_per_plate,
		       r.rating_avg, r.review_count, r.has_3d_tour, r.hero_image_url,
		       (SELECT COUNT(*) FROM restaurant_videos v WHERE v.restaurant_id = r.id) AS video_count
		FROM restaurants r
		%s
		ORDER BY r.rating_avg DESC, r.created_at DESC
		LIMIT $%d OFFSET $%d`, whereSQL, len(args)-1, len(args))

	rows, err := s.pool.Query(ctx, listSQL, args...)
	if err != nil {
		return ListResult{}, fmt.Errorf("list restaurants: %w", err)
	}
	defer rows.Close()

	out := make([]RestaurantCard, 0, f.Limit)
	for rows.Next() {
		var c RestaurantCard
		var price *int
		var heroURL *string
		var ratingAvg float64
		if err := rows.Scan(&c.ID, &c.Name, &c.Cuisines, &c.Location, &c.City,
			&price, &ratingAvg, &c.ReviewCount, &c.Has3DTour, &heroURL,
			&c.VideoCount); err != nil {
			return ListResult{}, fmt.Errorf("scan restaurant: %w", err)
		}
		c.AvgPricePerPlate = price
		c.HeroImageURL = heroURL
		c.AvgRating = ratingAvg
		out = append(out, c)
	}
	return ListResult{
		Restaurants: out,
		Total:       total,
		HasMore:     offset+len(out) < total,
	}, rows.Err()
}

func (s *PGStore) Get(ctx context.Context, id uuid.UUID) (*RestaurantDetail, error) {
	var d RestaurantDetail
	var ownerID *uuid.UUID
	var hoursJSON []byte
	var rating float64

	err := s.pool.QueryRow(ctx, `
		SELECT id, owner_id, name, description, cuisines, location, city, address,
		       latitude, longitude, phone, email, website, hours,
		       avg_price_per_plate, capacity, dress_code, highlights, hero_image_url,
		       has_3d_tour, rating_avg, review_count, is_verified, created_at
		FROM restaurants WHERE id = $1`, id,
	).Scan(&d.ID, &ownerID, &d.Name, &d.Description, &d.Cuisines, &d.Location,
		&d.City, &d.Address, &d.Latitude, &d.Longitude, &d.Phone, &d.Email,
		&d.Website, &hoursJSON, &d.AvgPricePerPlate, &d.Capacity, &d.DressCode,
		&d.Highlights, &d.HeroImageURL, &d.Has3DTour, &rating, &d.ReviewCount,
		&d.IsVerified, &d.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("get restaurant: %w", err)
	}
	if ownerID != nil {
		s := ownerID.String()
		d.OwnerID = &s
	}
	d.AvgRating = rating
	if len(hoursJSON) > 0 {
		_ = json.Unmarshal(hoursJSON, &d.Hours)
	}
	if d.Hours == nil {
		d.Hours = []Hour{}
	}
	if d.Highlights == nil {
		d.Highlights = []string{}
	}
	if d.Cuisines == nil {
		d.Cuisines = []string{}
	}
	return &d, nil
}

// ----- Videos --------------------------------------------------------------

func (s *PGStore) ListVideos(ctx context.Context, restaurantID uuid.UUID) ([]VideoItem, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, restaurant_id, title, type, mux_playback_id, thumbnail_url,
		       duration_seconds, views, created_at
		FROM restaurant_videos
		WHERE restaurant_id = $1
		ORDER BY created_at DESC`, restaurantID)
	if err != nil {
		return nil, fmt.Errorf("list videos: %w", err)
	}
	defer rows.Close()

	out := []VideoItem{}
	for rows.Next() {
		var v VideoItem
		if err := rows.Scan(&v.ID, &v.RestaurantID, &v.Title, &v.Type,
			&v.MuxPlaybackID, &v.ThumbnailURL, &v.DurationSeconds, &v.Views,
			&v.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, v)
	}
	return out, rows.Err()
}

func (s *PGStore) InsertVideo(ctx context.Context, restaurantID uuid.UUID, req CreateVideoReq) (*VideoItem, error) {
	v := VideoItem{
		ID:              uuid.New(),
		RestaurantID:    restaurantID,
		Title:           req.Title,
		Type:            req.Type,
		MuxPlaybackID:   req.MuxPlaybackID,
		ThumbnailURL:    req.ThumbnailURL,
		DurationSeconds: req.DurationSeconds,
		CreatedAt:       time.Now(),
	}
	_, err := s.pool.Exec(ctx, `
		INSERT INTO restaurant_videos
		  (id, restaurant_id, title, type, mux_asset_id, mux_playback_id,
		   thumbnail_url, duration_seconds, created_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
		v.ID, v.RestaurantID, v.Title, v.Type, req.MuxAssetID, req.MuxPlaybackID,
		req.ThumbnailURL, req.DurationSeconds, v.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("insert video: %w", err)
	}
	return &v, nil
}

// ----- Images --------------------------------------------------------------

func (s *PGStore) ListImages(ctx context.Context, restaurantID uuid.UUID) ([]ImageItem, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, restaurant_id, url, type, caption, sort_order, created_at
		FROM restaurant_images
		WHERE restaurant_id = $1
		ORDER BY sort_order, created_at`, restaurantID)
	if err != nil {
		return nil, fmt.Errorf("list images: %w", err)
	}
	defer rows.Close()

	out := []ImageItem{}
	for rows.Next() {
		var im ImageItem
		if err := rows.Scan(&im.ID, &im.RestaurantID, &im.URL, &im.Type,
			&im.Caption, &im.SortOrder, &im.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, im)
	}
	return out, rows.Err()
}

func (s *PGStore) InsertImage(ctx context.Context, restaurantID uuid.UUID, req CreateImageReq) (*ImageItem, error) {
	im := ImageItem{
		ID:           uuid.New(),
		RestaurantID: restaurantID,
		URL:          req.URL,
		Type:         req.Type,
		Caption:      req.Caption,
		SortOrder:    req.SortOrder,
		CreatedAt:    time.Now(),
	}
	_, err := s.pool.Exec(ctx, `
		INSERT INTO restaurant_images
		  (id, restaurant_id, url, type, caption, sort_order, created_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7)`,
		im.ID, im.RestaurantID, im.URL, im.Type, im.Caption, im.SortOrder, im.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("insert image: %w", err)
	}
	// If this is the first hero image, promote to restaurants.hero_image_url.
	if im.Type == "hero" {
		_, _ = s.pool.Exec(ctx,
			`UPDATE restaurants SET hero_image_url = $1, updated_at = NOW()
			 WHERE id = $2 AND (hero_image_url IS NULL OR hero_image_url = '')`,
			im.URL, restaurantID)
	}
	return &im, nil
}

// ----- Reviews -------------------------------------------------------------

func (s *PGStore) ListReviews(ctx context.Context, restaurantID uuid.UUID, page, limit int) (ReviewListResult, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	var total int
	if err := s.pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM restaurant_reviews
		 WHERE restaurant_id = $1 AND email_verified = TRUE`,
		restaurantID).Scan(&total); err != nil {
		return ReviewListResult{}, fmt.Errorf("count reviews: %w", err)
	}

	offset := (page - 1) * limit
	rows, err := s.pool.Query(ctx, `
		SELECT id, restaurant_id, user_name, rating, title, comment,
		       food_rating, ambiance_rating, service_rating, value_rating,
		       photos, created_at
		FROM restaurant_reviews
		WHERE restaurant_id = $1 AND email_verified = TRUE
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`, restaurantID, limit, offset)
	if err != nil {
		return ReviewListResult{}, fmt.Errorf("list reviews: %w", err)
	}
	defer rows.Close()

	out := []Review{}
	for rows.Next() {
		var r Review
		if err := rows.Scan(&r.ID, &r.RestaurantID, &r.UserName, &r.Rating,
			&r.Title, &r.Comment, &r.FoodRating, &r.AmbianceRating,
			&r.ServiceRating, &r.ValueRating, &r.Photos, &r.CreatedAt); err != nil {
			return ReviewListResult{}, err
		}
		if r.Photos == nil {
			r.Photos = []string{}
		}
		out = append(out, r)
	}
	return ReviewListResult{
		Reviews: out,
		Total:   total,
		HasMore: offset+len(out) < total,
	}, rows.Err()
}

func (s *PGStore) InsertReview(ctx context.Context, req CreateReviewReq, verifyToken string) (*Review, error) {
	r := Review{
		ID:             uuid.New(),
		RestaurantID:   req.RestaurantID,
		UserName:       req.UserName,
		Rating:         req.Rating,
		Title:          req.Title,
		Comment:        req.Comment,
		FoodRating:     req.FoodRating,
		AmbianceRating: req.AmbianceRating,
		ServiceRating:  req.ServiceRating,
		ValueRating:    req.ValueRating,
		Photos:         req.Photos,
		CreatedAt:      time.Now(),
	}
	if r.Photos == nil {
		r.Photos = []string{}
	}
	_, err := s.pool.Exec(ctx, `
		INSERT INTO restaurant_reviews
		  (id, restaurant_id, user_name, user_email, rating, title, comment,
		   food_rating, ambiance_rating, service_rating, value_rating,
		   photos, email_verified, verify_token, verify_sent_at, created_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,FALSE,$13,$14,$15)`,
		r.ID, r.RestaurantID, r.UserName, req.UserEmail, r.Rating, r.Title, r.Comment,
		r.FoodRating, r.AmbianceRating, r.ServiceRating, r.ValueRating,
		r.Photos, verifyToken, time.Now(), r.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("insert review: %w", err)
	}
	return &r, nil
}

func (s *PGStore) VerifyReview(ctx context.Context, token string) error {
	tag, err := s.pool.Exec(ctx,
		`UPDATE restaurant_reviews
		 SET email_verified = TRUE, verify_token = NULL
		 WHERE verify_token = $1`, token)
	if err != nil {
		return fmt.Errorf("verify review: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
