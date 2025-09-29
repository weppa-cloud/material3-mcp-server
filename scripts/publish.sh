#!/bin/bash
set -e

echo "📦 Material 3 MCP Server - NPM Publication Script"
echo "=================================================="

# Run tests (when available)
echo "🔨 Building project..."
npm run build

# Verify build output
if [ ! -f "build/index.js" ]; then
  echo "❌ Error: Build failed - index.js not found"
  exit 1
fi

# Make executable
chmod +x build/index.js

echo ""
echo "✅ Build successful!"
echo ""
echo "📝 Ready to publish. Run the following command to publish:"
echo "   npm publish --access public"
echo ""
echo "⚠️  Note: Make sure you're logged in with:"
echo "   npm login"
echo "   Username: weppa-cloud"
echo ""