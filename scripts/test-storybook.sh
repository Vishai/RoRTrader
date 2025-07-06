#!/bin/bash

echo "🎨 Testing Storybook setup for RoR Trader..."
echo "==========================================="

# Navigate to web app
cd apps/web

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  Node modules not found in web app. Installing..."
    npm install
fi

# Check if Storybook can build
echo ""
echo "📚 Building Storybook..."
npm run build-storybook -- --quiet

if [ $? -eq 0 ]; then
    echo "✅ Storybook build successful!"
    echo ""
    echo "🚀 To run Storybook:"
    echo "   cd apps/web"
    echo "   npm run storybook"
    echo ""
    echo "📂 Stories created:"
    find components -name "*.stories.tsx" -type f | sort
else
    echo "❌ Storybook build failed. Please check the configuration."
fi
