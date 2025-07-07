#!/bin/bash
# Development script to run without Docker

echo "🚀 Starting RoR Trader in development mode (no Docker)"
echo ""
echo "⚠️  Note: This requires PostgreSQL and Redis to be installed locally"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running on localhost:5432"
    echo "   Please install and start PostgreSQL first"
    echo "   On macOS: brew install postgresql && brew services start postgresql"
    exit 1
fi

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis is not running on localhost:6379"
    echo "   Please install and start Redis first"
    echo "   On macOS: brew install redis && brew services start redis"
    exit 1
fi

echo "✅ PostgreSQL is running"
echo "✅ Redis is running"
echo ""

# Create database if it doesn't exist
echo "Creating database if needed..."
createdb rortrader 2>/dev/null || echo "Database 'rortrader' already exists"

# Update DATABASE_URL for local PostgreSQL
export DATABASE_URL="postgresql://$(whoami)@localhost:5432/rortrader?schema=public"

# Navigate to API directory
cd apps/api

# Run migrations
echo "Running database migrations..."
npx prisma migrate dev --name init

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Start the API server
echo ""
echo "Starting API server..."
npm run dev
