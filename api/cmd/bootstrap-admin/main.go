// Command bootstrap-admin creates or resets the first admin account.
//
// This is a one-shot utility: you don't have a UI to create the admin yet,
// because the admin-create-user endpoint requires an admin caller.
//
// Usage:
//
//	DATABASE_URL=postgres://... \
//	  go run ./cmd/bootstrap-admin \
//	    -email vik@viktheatre.in \
//	    -name  "Vik Prasad" \
//	    -phone +919000000001
//
// Flags:
//
//	-email     required
//	-name      required
//	-phone     required (E.164 with leading +)
//	-password  optional; if empty a readable default is generated and printed
//	-role      optional; defaults to "admin" (also accepts instructor)
//
// Upserts by email — safe to re-run, overwrites password_hash and flips
// must_change_password to TRUE so the admin changes it on next login.
package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	var (
		email    = flag.String("email", "", "admin email (required)")
		name     = flag.String("name", "", "admin full name (required)")
		phone    = flag.String("phone", "", "admin phone E.164 e.g. +919000000001 (required)")
		password = flag.String("password", "", "optional explicit password; if empty a readable default is generated")
		role     = flag.String("role", "admin", "role: admin | instructor")
	)
	flag.Parse()

	if *email == "" || *name == "" || *phone == "" {
		fmt.Fprintln(os.Stderr, "error: -email, -name, -phone are all required")
		flag.Usage()
		os.Exit(2)
	}
	if *role != "admin" && *role != "instructor" {
		fmt.Fprintln(os.Stderr, "error: -role must be 'admin' or 'instructor'")
		os.Exit(2)
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		fmt.Fprintln(os.Stderr, "error: DATABASE_URL env var required")
		os.Exit(2)
	}

	pwd := *password
	if pwd == "" {
		pwd = generateDefaultPassword(*name)
	}
	if len(pwd) < 8 {
		fmt.Fprintln(os.Stderr, "error: password must be at least 8 characters")
		os.Exit(2)
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(pwd), 12)
	if err != nil {
		fmt.Fprintf(os.Stderr, "bcrypt failed: %v\n", err)
		os.Exit(1)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		fmt.Fprintf(os.Stderr, "db connect failed: %v\n", err)
		os.Exit(1)
	}
	defer pool.Close()

	const q = `
		INSERT INTO users (name, email, phone, role, password_hash, must_change_password)
		VALUES ($1, $2, $3, $4::user_role, $5, TRUE)
		ON CONFLICT (phone) DO UPDATE
		  SET name                 = EXCLUDED.name,
		      email                = EXCLUDED.email,
		      role                 = EXCLUDED.role,
		      password_hash        = EXCLUDED.password_hash,
		      must_change_password = TRUE,
		      password_changed_at  = NULL
		RETURNING id::text
	`
	var id string
	err = pool.QueryRow(ctx, q, *name, strings.ToLower(*email), *phone, *role, string(hash)).
		Scan(&id)
	if err != nil {
		fmt.Fprintf(os.Stderr, "upsert failed: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("✔ admin bootstrapped")
	fmt.Printf("  id:       %s\n", id)
	fmt.Printf("  email:    %s\n", strings.ToLower(*email))
	fmt.Printf("  phone:    %s\n", *phone)
	fmt.Printf("  role:     %s\n", *role)
	fmt.Printf("  password: %s   (must be changed on first login)\n", pwd)
}

// generateDefaultPassword keeps this CLI independent of the auth package so we
// don't bring in its transitive deps. Mirrors auth.GenerateDefaultPassword.
func generateDefaultPassword(prefix string) string {
	word := "Vik"
	if fields := strings.Fields(strings.TrimSpace(prefix)); len(fields) > 0 {
		word = fields[0]
	}
	var b strings.Builder
	for _, r := range word {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') {
			b.WriteRune(r)
		}
		if b.Len() >= 6 {
			break
		}
	}
	clean := b.String()
	if clean == "" {
		clean = "Vik"
	}
	clean = strings.ToUpper(clean[:1]) + strings.ToLower(clean[1:])
	return fmt.Sprintf("%s-%d", clean, 1000+int(time.Now().UnixNano()%9000))
}
