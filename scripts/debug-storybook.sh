#!/bin/bash

echo "🔍 Troubleshooting Storybook for RoR Trader..."
echo "============================================="

cd /Users/brandonarmstrong/Documents/Github/RoRTrader/apps/web

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found in web app"
    echo "   Run: npm install from project root"
    exit 1
fi

# Check for class-variance-authority
if [ ! -d "node_modules/class-variance-authority" ]; then
    echo "❌ class-variance-authority not installed"
    echo "   This is required for the button component"
    exit 1
fi

# Try to run Storybook with more verbose output
echo ""
echo "🚀 Starting Storybook with verbose output..."
echo ""
npm run storybook -- --debug-webpack
