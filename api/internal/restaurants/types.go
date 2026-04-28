package restaurants

import (
	"time"

	"github.com/google/uuid"
)

// Hour describes a single weekday's opening hours.
type Hour struct {
	Day    string `json:"day"`
	Open   string `json:"open"`
	Close  string `json:"close"`
	Closed bool   `json:"closed"`
}

// RestaurantCard is the discovery-list shape.
type RestaurantCard struct {
	ID               uuid.UUID `json:"id"`
	Name             string    `json:"name"`
	Cuisines         []string  `json:"cuisine"`
	Location         string    `json:"location"`
	City             string    `json:"city"`
	AvgPricePerPlate *int      `json:"avg_price_per_plate,omitempty"`
	AvgRating        float64   `json:"avg_rating"`
	ReviewCount      int       `json:"review_count"`
	Has3DTour        bool      `json:"has_3d_tour"`
	HeroImageURL     *string   `json:"hero_image_url,omitempty"`
	VideoCount       int       `json:"video_count"`
}

// RestaurantDetail is the full restaurant record.
type RestaurantDetail struct {
	ID               uuid.UUID `json:"id"`
	Name             string    `json:"name"`
	Description      *string   `json:"description,omitempty"`
	Cuisines         []string  `json:"cuisine"`
	Location         string    `json:"location"`
	City             string    `json:"city"`
	Address          string    `json:"address"`
	Latitude         *float64  `json:"latitude,omitempty"`
	Longitude        *float64  `json:"longitude,omitempty"`
	Phone            *string   `json:"phone,omitempty"`
	Email            *string   `json:"email,omitempty"`
	Website          *string   `json:"website,omitempty"`
	Hours            []Hour    `json:"hours"`
	AvgPricePerPlate *int      `json:"avg_price_per_plate,omitempty"`
	Capacity         int       `json:"capacity"`
	DressCode        *string   `json:"dress_code,omitempty"`
	Highlights       []string  `json:"highlights"`
	HeroImageURL     *string   `json:"hero_image_url,omitempty"`
	Has3DTour        bool      `json:"has_3d_tour"`
	AvgRating        float64   `json:"avg_rating"`
	ReviewCount      int       `json:"review_count"`
	IsVerified       bool      `json:"is_verified"`
	OwnerID          *string   `json:"owner_id,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
}

// VideoItem is the public video shape.
type VideoItem struct {
	ID              uuid.UUID `json:"id"`
	RestaurantID    uuid.UUID `json:"restaurant_id"`
	Title           string    `json:"title"`
	Type            string    `json:"type"`
	MuxPlaybackID   *string   `json:"mux_playback_id,omitempty"`
	ThumbnailURL    *string   `json:"thumbnail_url,omitempty"`
	DurationSeconds *int      `json:"duration_seconds,omitempty"`
	Views           int       `json:"views"`
	CreatedAt       time.Time `json:"created_at"`
}

// ImageItem is a restaurant image.
type ImageItem struct {
	ID           uuid.UUID `json:"id"`
	RestaurantID uuid.UUID `json:"restaurant_id"`
	URL          string    `json:"url"`
	Type         string    `json:"type"`
	Caption      *string   `json:"caption,omitempty"`
	SortOrder    int       `json:"sort_order"`
	CreatedAt    time.Time `json:"created_at"`
}

// Review is the public review shape.
type Review struct {
	ID             uuid.UUID `json:"id"`
	RestaurantID   uuid.UUID `json:"restaurant_id"`
	UserName       string    `json:"user_name"`
	Rating         float64   `json:"rating"`
	Title          *string   `json:"title,omitempty"`
	Comment        *string   `json:"comment,omitempty"`
	FoodRating     *float64  `json:"food_rating,omitempty"`
	AmbianceRating *float64  `json:"ambiance_rating,omitempty"`
	ServiceRating  *float64  `json:"service_rating,omitempty"`
	ValueRating    *float64  `json:"value_rating,omitempty"`
	Photos         []string  `json:"photos"`
	CreatedAt      time.Time `json:"created_at"`
}

// ListFilters apply to GET /v1/restaurants.
type ListFilters struct {
	Cuisine     string
	Location    string
	City        string
	MinPrice    *int
	MaxPrice    *int
	CapacityMin *int
	RatingMin   *float64
	Page        int
	Limit       int
}

// ListResult is the paginated list response.
type ListResult struct {
	Restaurants []RestaurantCard `json:"restaurants"`
	Total       int              `json:"total"`
	HasMore     bool             `json:"has_more"`
}

// CreateImageReq is the JSON body for POST /admin/restaurants/{id}/images.
type CreateImageReq struct {
	URL       string  `json:"url"`
	Type      string  `json:"type"`
	Caption   *string `json:"caption,omitempty"`
	SortOrder int     `json:"sort_order"`
}

// CreateVideoReq is the JSON body for POST /admin/restaurants/{id}/videos.
type CreateVideoReq struct {
	Title           string  `json:"title"`
	Type            string  `json:"type"`
	MuxAssetID      *string `json:"mux_asset_id,omitempty"`
	MuxPlaybackID   *string `json:"mux_playback_id,omitempty"`
	ThumbnailURL    *string `json:"thumbnail_url,omitempty"`
	DurationSeconds *int    `json:"duration_seconds,omitempty"`
}

// CreateReviewReq is the JSON body for POST /v1/reviews.
type CreateReviewReq struct {
	RestaurantID   uuid.UUID `json:"restaurant_id"`
	UserName       string    `json:"user_name"`
	UserEmail      string    `json:"user_email"`
	Rating         float64   `json:"rating"`
	Title          *string   `json:"title,omitempty"`
	Comment        *string   `json:"comment,omitempty"`
	FoodRating     *float64  `json:"food_rating,omitempty"`
	AmbianceRating *float64  `json:"ambiance_rating,omitempty"`
	ServiceRating  *float64  `json:"service_rating,omitempty"`
	ValueRating    *float64  `json:"value_rating,omitempty"`
	Photos         []string  `json:"photos,omitempty"`
}

// ReviewListResult is a paginated review list.
type ReviewListResult struct {
	Reviews []Review `json:"reviews"`
	Total   int      `json:"total"`
	HasMore bool     `json:"has_more"`
}
