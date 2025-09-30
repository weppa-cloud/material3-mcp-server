#!/bin/bash
# Material 3 MCP Server - Package Validation Script
# Tests NPM installation and basic functionality

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 Material 3 MCP Server - Package Validation${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 1: Check Node.js version
echo -e "${BLUE}📌 Test 1: Checking Node.js version...${NC}"
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    echo -e "${GREEN}✅ Node.js version $(node --version) is compatible (≥18.0.0)${NC}"
else
    echo -e "${RED}❌ Node.js version $(node --version) is too old. Required: ≥18.0.0${NC}"
    echo -e "${YELLOW}   Install the latest LTS version from https://nodejs.org/${NC}"
    exit 1
fi

# Test 2: NPM installation
echo ""
echo -e "${BLUE}📌 Test 2: Verifying NPM installation...${NC}"
if npx --yes @weppa-cloud/material3-mcp-server --version 2>/dev/null | grep -q "[0-9]"; then
    VERSION=$(npx --yes @weppa-cloud/material3-mcp-server --version 2>/dev/null)
    echo -e "${GREEN}✅ NPM package installed successfully (version ${VERSION})${NC}"
else
    echo -e "${RED}❌ Failed to install NPM package${NC}"
    echo -e "${YELLOW}   Try: npm install -g @weppa-cloud/material3-mcp-server${NC}"
    exit 1
fi

# Test 3: Executable availability
echo ""
echo -e "${BLUE}📌 Test 3: Checking executable...${NC}"
if command -v material3-mcp &> /dev/null; then
    echo -e "${GREEN}✅ Executable 'material3-mcp' is available in PATH${NC}"
elif npm list -g @weppa-cloud/material3-mcp-server &> /dev/null; then
    echo -e "${GREEN}✅ Package is globally installed${NC}"
else
    echo -e "${YELLOW}⚠️  Executable not in PATH (normal for npx usage)${NC}"
fi

# Test 4: Configuration file validation
echo ""
echo -e "${BLUE}📌 Test 4: Validating configuration examples...${NC}"
CONFIG_EXAMPLE='{"mcpServers":{"material3":{"command":"npx","args":["-y","@weppa-cloud/material3-mcp-server"]}}}'

if command -v jq &> /dev/null; then
    if echo "$CONFIG_EXAMPLE" | jq . > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Configuration JSON is valid${NC}"
    else
        echo -e "${RED}❌ Configuration JSON is invalid${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  jq not installed, skipping JSON validation${NC}"
    echo -e "${YELLOW}   Install jq for better validation: brew install jq (macOS) or apt install jq (Linux)${NC}"
fi

# Test 5: Build artifacts
echo ""
echo -e "${BLUE}📌 Test 5: Checking build artifacts...${NC}"
if [ -d "build" ]; then
    if [ -f "build/index.js" ]; then
        echo -e "${GREEN}✅ Build directory exists with entry point${NC}"
    else
        echo -e "${YELLOW}⚠️  Build directory exists but missing index.js${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Build directory not found (normal if testing NPM package)${NC}"
fi

# Test 6: Documentation availability
echo ""
echo -e "${BLUE}📌 Test 6: Checking documentation...${NC}"
if [ -d "docs" ]; then
    DOC_COUNT=$(find docs -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$DOC_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Found ${DOC_COUNT} documentation files${NC}"
    else
        echo -e "${YELLOW}⚠️  No documentation files found${NC}"
    fi
else
    # Check NPM registry
    if curl -s https://www.npmjs.com/package/@weppa-cloud/material3-mcp-server | grep -q "Material 3"; then
        echo -e "${GREEN}✅ NPM package documentation is accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not verify documentation availability${NC}"
    fi
fi

# Test 7: Dependencies check
echo ""
echo -e "${BLUE}📌 Test 7: Checking dependencies...${NC}"
if [ -f "package.json" ]; then
    REQUIRED_DEPS=("@modelcontextprotocol/sdk" "zod" "axios")
    MISSING_DEPS=0

    for dep in "${REQUIRED_DEPS[@]}"; do
        if grep -q "\"$dep\"" package.json; then
            echo -e "${GREEN}  ✓ $dep${NC}"
        else
            echo -e "${RED}  ✗ $dep (missing)${NC}"
            MISSING_DEPS=$((MISSING_DEPS + 1))
        fi
    done

    if [ $MISSING_DEPS -eq 0 ]; then
        echo -e "${GREEN}✅ All required dependencies are listed${NC}"
    else
        echo -e "${RED}❌ Missing ${MISSING_DEPS} required dependencies${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  package.json not found (normal for NPM package test)${NC}"
fi

# Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All validation tests passed!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Configure Claude Desktop:"
echo -e "     ${YELLOW}~/Library/Application Support/Claude/claude_desktop_config.json${NC}"
echo -e ""
echo -e "  2. Configure Cursor IDE:"
echo -e "     ${YELLOW}~/.cursor/config/mcp.json${NC}"
echo -e ""
echo -e "  3. Read getting started guide:"
echo -e "     ${YELLOW}https://github.com/weppa-cloud/material3-mcp-server/blob/main/docs/getting-started.md${NC}"
echo -e ""
echo -e "  4. Try the MCP Inspector:"
echo -e "     ${YELLOW}npm run inspector${NC} (opens http://localhost:6274)"
echo -e ""
echo -e "${GREEN}Happy coding! 🎨${NC}"
echo ""