#!/bin/bash

# RoR Trader Docker Environment Setup Script

set -e  # Exit on error

echo "🚀 RoR Trader Docker Environment Setup"
echo "======================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration values"
    echo "   Especially set strong values for:"
    echo "   - JWT_SECRET"
    echo "   - ENCRYPTION_KEY"
    echo "   - SESSION_SECRET"
fi

# Function to wait for a service to be healthy
wait_for_service() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $service to be healthy..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker compose ps --services --filter "status=running" | grep -q "^$service$"; then
            echo "✅ $service is running"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service failed to start"
    return 1
}

# Start services
echo ""
echo "🐳 Starting Docker services..."
docker compose up -d

# Wait for services to be healthy
echo ""
wait_for_service "postgres"
wait_for_service "redis"

echo ""
echo "✨ Docker services are ready!"
echo ""
echo "📌 Service URLs:"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo "   - Adminer (DB UI): http://localhost:8080"
echo "   - Redis Commander: http://localhost:8081"
echo "   - Grafana: http://localhost:3001 (admin/admin)"
echo "   - Prometheus: http://localhost:9090"
echo "   - Mailpit: http://localhost:8026 (SMTP on port 1026)"
echo ""
echo "📝 Database credentials:"
echo "   - Username: rortrader"
echo "   - Password: password"
echo "   - Database: rortrader"
echo ""
echo "🔧 Useful commands:"
echo "   - View logs: docker compose logs -f"
echo "   - Stop services: docker compose down"
echo "   - Reset everything: docker compose down -v"
echo ""
echo "🎉 Happy coding!"
