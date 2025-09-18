#!/bin/bash

echo "🔍 Checking ports 3000 and 3001..."
echo ""

# Check port 3000
echo "Port 3000 (Frontend):"
lsof -i :3000 | grep LISTEN || echo "  ✅ Port 3000 is free"
echo ""

# Check port 3001
echo "Port 3001 (Backend API):"
lsof -i :3001 | grep LISTEN || echo "  ✅ Port 3001 is free"
echo ""

echo "To kill processes using these ports:"
echo "  kill -9 \$(lsof -ti:3000)  # Kill process on port 3000"
echo "  kill -9 \$(lsof -ti:3001)  # Kill process on port 3001"
echo ""
echo "Or kill both at once:"
echo "  kill -9 \$(lsof -ti:3000,3001)"