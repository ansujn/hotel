#!/bin/bash
# Railway Deployment Setup for Kibana API

set -e

echo "🚀 Railway Deployment Setup"
echo "============================"

# Database connection (already set up)
DB_URL="postgresql://neondb_owner:npg_EU8Kn4hgqAfC@ep-winter-frog-annrgtoq.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

echo "✅ Neon Database: Configured"
echo "✅ Migrations: Complete (24 tables)"
echo ""

# Step 1: Create/link Railway project
echo "Step 1: Link to Railway project"
echo "  → Go to https://railway.app/new/project"
echo "  → Select 'GitHub Repo' → Connect ansujn/hotel"
echo "  → Deploy /api folder"
echo ""

# Step 2: Set environment variables on Railway
echo "Step 2: Set Environment Variables in Railway Dashboard:"
echo ""
echo "DATABASE_URL=$DB_URL"
echo "API_PORT=8080"
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "ADMIN_PASSWORD=kibana-admin-secure-2026"
echo "APP_ENV=production"
echo ""

# Step 3: Get the Railway URL and update frontend
echo "Step 3: Once deployed, Railway will give you a URL like:"
echo "  kibana-api-prod.railway.app"
echo ""
echo "Then update: /web/.env.production"
echo "  NEXT_PUBLIC_API_BASE_URL=https://[your-railway-url]"
echo ""

echo "For GitHub + Railway auto-deploy:"
echo "  1. Push main branch: git push origin main"
echo "  2. Railway auto-builds and deploys from Dockerfile"
echo "  3. Monitor at: https://railway.app/dashboard"
