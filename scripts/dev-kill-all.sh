#!/bin/bash

echo "🛑 Stopping all RoR Trader processes..."
echo ""

# Kill any npm processes related to ror-trader
pkill -f "ror-trader" || true

# Kill specific ports
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "Killing process on port 3000..."
    kill -9 $(lsof -ti:3000)
fi

if lsof -ti:3001 > /dev/null 2>&1; then
    echo "Killing process on port 3001..."
    kill -9 $(lsof -ti:3001)
fi

# Kill any nodemon processes
pkill -f "nodemon" || true

# Kill any tsx processes
pkill -f "tsx" || true

# Kill any next processes
pkill -f "next" || true

echo ""
echo "✅ All processes stopped"
echo ""
echo "Waiting 2 seconds for ports to be released..."
sleep 2

echo ""
echo "🚀 Starting fresh development servers..."
echo ""

# Start the dev servers
npm run dev