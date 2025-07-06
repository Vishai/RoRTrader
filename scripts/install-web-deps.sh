#!/bin/bash

echo "📦 Installing dependencies for RoR Trader Monorepo..."
echo "==================================================="

# Navigate to project root
cd /Users/brandonarmstrong/Documents/Github/RoRTrader

# Install all dependencies (monorepo will handle workspaces)
echo "Installing all dependencies (this may take a few minutes)..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🚀 To run Storybook:"
    echo "   cd apps/web"
    echo "   npm run storybook"
    echo ""
    echo "🌐 To run the web app:"
    echo "   cd apps/web"
    echo "   npm run dev"
else
    echo "❌ Installation failed. Please check for errors above."
fi
