#!/bin/bash

echo "🔍 RoR Trader Integration Test"
echo "=============================="
echo ""

# Check if backend API is running
echo "1. Checking Backend API..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "   ✅ Backend API is running"
else
    echo "   ❌ Backend API is NOT running"
    echo "   Run: cd apps/api && npm run dev"
fi
echo ""

# Check if frontend is running
echo "2. Checking Frontend..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Frontend is running"
else
    echo "   ❌ Frontend is NOT running"
    echo "   Run: cd apps/web && npm run dev"
fi
echo ""

# Check if database is running
echo "3. Checking Database..."
if docker ps | grep postgres > /dev/null 2>&1; then
    echo "   ✅ PostgreSQL is running"
else
    echo "   ❌ PostgreSQL is NOT running"
    echo "   Run: docker-compose up -d postgres"
fi
echo ""

# Check if Redis is running
echo "4. Checking Redis..."
if docker ps | grep redis > /dev/null 2>&1; then
    echo "   ✅ Redis is running"
else
    echo "   ❌ Redis is NOT running"
    echo "   Run: docker-compose up -d redis"
fi
echo ""

# Test API endpoints
echo "5. Testing API Endpoints..."
echo "   Testing /api/analysis/indicators..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/analysis/indicators)
if [ "$response" = "200" ]; then
    echo "   ✅ Indicators endpoint working"
else
    echo "   ❌ Indicators endpoint returned: $response"
fi

echo "   Testing /api/strategies/templates..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/strategies/templates)
if [ "$response" = "200" ]; then
    echo "   ✅ Templates endpoint working"
else
    echo "   ❌ Templates endpoint returned: $response"
fi
echo ""

echo "6. Summary"
echo "   Frontend Integration: ✅ Complete"
echo "   Backend Implementation: ❌ Needed"
echo "   Database Schema: ✅ Defined"
echo "   API Endpoints: ❌ Not Implemented"
echo ""
echo "📋 Next Steps:"
echo "   1. Start backend: cd apps/api && npm run dev"
echo "   2. Run migrations: cd apps/api && npm run db:migrate"
echo "   3. Implement missing endpoints"
echo "   4. Or create mock API server for development"