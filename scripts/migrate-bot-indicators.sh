#!/bin/bash

# Script to add bot indicator fields to the database

echo "🚀 Adding bot indicator fields to RoR Trader..."

# Navigate to API directory
cd apps/api

# Generate Prisma migration
echo "📋 Creating migration..."
npx prisma migrate dev --name add-bot-trading-fields

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo "✅ Migration complete! Bot model now includes:"
echo "   - symbol field for trading instruments"
echo "   - timeframe field for indicator calculations"
echo "   - signalMode for combining indicator signals"
echo "   - BotIndicator model for indicator configurations"

echo ""
echo "Next steps:"
echo "1. Update DTOs to include new fields"
echo "2. Update bot service to handle indicators"
echo "3. Update UI components to configure indicators"
