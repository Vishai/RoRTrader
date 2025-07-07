#!/bin/bash

# RoR Trader Web Development Script
# This script runs only the Next.js web app for UI development

echo "🚀 Starting RoR Trader Web App..."

# Kill any existing process on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Navigate to web app and start
cd apps/web
npm run dev
