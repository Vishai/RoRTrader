#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 RoR Trader API - Database Setup${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Starting database services...${NC}"
docker-compose up -d postgres redis

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
sleep 5

# Check if PostgreSQL is ready
until docker-compose exec -T postgres pg_isready -U rortrader > /dev/null 2>&1; do
    echo -n "."
    sleep 1
done
echo ""

echo -e "${GREEN}✅ PostgreSQL is ready!${NC}"

# Run Prisma migrations
echo -e "${YELLOW}🔄 Running database migrations...${NC}"
npx prisma migrate dev --name init

# Generate Prisma client
echo -e "${YELLOW}🔧 Generating Prisma client...${NC}"
npx prisma generate

echo -e "${GREEN}✅ Database setup complete!${NC}"
echo ""
echo -e "${YELLOW}📊 Database Management UIs:${NC}"
echo -e "   Adminer (PostgreSQL): http://localhost:8080"
echo -e "   Redis Commander: http://localhost:8081"
echo ""
echo -e "${GREEN}🎉 Ready to start the API server!${NC}"
echo -e "   Run: ${YELLOW}npm run dev${NC}"
