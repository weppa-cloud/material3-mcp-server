#!/bin/bash

# Material3 MCP Server - Automated Release Script
# Usage: ./scripts/release.sh <version> "<release notes>"
# Example: ./scripts/release.sh 1.2.0 "New features and bug fixes"

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check arguments
if [ "$#" -lt 1 ]; then
    echo -e "${RED}Error: Missing version argument${NC}"
    echo "Usage: $0 <version> [release_notes]"
    echo "Example: $0 1.2.0 'New features and bug fixes'"
    exit 1
fi

VERSION=$1
RELEASE_NOTES=${2:-"Release v$VERSION"}
TAG="v$VERSION"

echo -e "${BLUE}🚀 Starting release process for version $VERSION${NC}"
echo ""

# Verify we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Warning: You're not on main branch (current: $CURRENT_BRANCH)${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}Error: You have uncommitted changes${NC}"
    git status --short
    exit 1
fi

# Check if version already exists as a tag
if git rev-parse "$TAG" >/dev/null 2>&1; then
    echo -e "${RED}Error: Tag $TAG already exists${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Repository is clean"
echo ""

# Update version in package.json
echo -e "${BLUE}📝 Updating package.json to version $VERSION${NC}"
# Use npm to update version (handles package-lock.json too)
npm version $VERSION --no-git-tag-version

echo -e "${GREEN}✓${NC} Version updated in package.json"
echo ""

# Run tests
echo -e "${BLUE}🧪 Running tests...${NC}"
if npm test; then
    echo -e "${GREEN}✓${NC} All tests passed"
else
    echo -e "${RED}✗${NC} Tests failed"
    echo "Reverting changes..."
    git checkout package.json package-lock.json
    exit 1
fi
echo ""

# Build project
echo -e "${BLUE}🔨 Building project...${NC}"
if npm run build; then
    echo -e "${GREEN}✓${NC} Build successful"
else
    echo -e "${RED}✗${NC} Build failed"
    echo "Reverting changes..."
    git checkout package.json package-lock.json
    exit 1
fi
echo ""

# Commit version bump
echo -e "${BLUE}📦 Committing version bump${NC}"
git add package.json package-lock.json
git commit -m "chore: bump version to $VERSION"
echo -e "${GREEN}✓${NC} Version committed"
echo ""

# Create git tag
echo -e "${BLUE}🏷️  Creating git tag $TAG${NC}"
git tag -a "$TAG" -m "Release $VERSION"
echo -e "${GREEN}✓${NC} Tag created"
echo ""

# Push changes
echo -e "${BLUE}⬆️  Pushing to GitHub${NC}"
git push origin main
git push --tags
echo -e "${GREEN}✓${NC} Changes pushed"
echo ""

# Create GitHub Release
echo -e "${BLUE}📢 Creating GitHub Release${NC}"

# Generate changelog link
PREV_TAG=$(git describe --abbrev=0 --tags $(git rev-list --tags --skip=1 --max-count=1) 2>/dev/null || echo "")
if [ -n "$PREV_TAG" ]; then
    CHANGELOG_URL="https://github.com/weppa-cloud/material3-mcp-server/compare/$PREV_TAG...$TAG"
else
    CHANGELOG_URL="https://github.com/weppa-cloud/material3-mcp-server/commits/$TAG"
fi

# Create release notes
FULL_NOTES="## What's New

$RELEASE_NOTES

## 📥 Installation

\`\`\`bash
npm install -g @weppa-cloud/material3-mcp-server@$VERSION
\`\`\`

Or use with npx:
\`\`\`bash
npx @weppa-cloud/material3-mcp-server@$VERSION
\`\`\`

## 🔗 Links

- 📦 NPM: https://www.npmjs.com/package/@weppa-cloud/material3-mcp-server/v/$VERSION
- 📝 Full Changelog: $CHANGELOG_URL"

if gh release create "$TAG" \
    --title "v$VERSION" \
    --notes "$FULL_NOTES"; then
    echo -e "${GREEN}✓${NC} GitHub Release created"
else
    echo -e "${RED}✗${NC} Failed to create GitHub Release"
    echo "You can create it manually at:"
    echo "https://github.com/weppa-cloud/material3-mcp-server/releases/new?tag=$TAG"
fi
echo ""

# Success message
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Release v$VERSION completed successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. GitHub Actions will automatically publish to NPM"
echo "   Monitor: https://github.com/weppa-cloud/material3-mcp-server/actions"
echo ""
echo "2. Verify NPM publication in ~2 minutes:"
echo "   npm view @weppa-cloud/material3-mcp-server version"
echo ""
echo "3. View the release:"
echo "   https://github.com/weppa-cloud/material3-mcp-server/releases/tag/$TAG"
echo ""