#!/bin/bash

# Kill any processes using our development ports
echo "🧹 Cleaning up development ports..."

# Kill processes on port 3000 (Frontend)
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "Killing process on port 3000..."
    kill -9 $(lsof -ti:3000)
    echo "✅ Port 3000 cleared"
else
    echo "✅ Port 3000 already free"
fi

# Kill processes on port 3001 (Backend)
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "Killing process on port 3001..."
    kill -9 $(lsof -ti:3001)
    echo "✅ Port 3001 cleared"
else
    echo "✅ Port 3001 already free"
fi

echo ""
echo "🚀 Starting RoR Trader development servers..."
echo ""

# Start both servers
npm run dev