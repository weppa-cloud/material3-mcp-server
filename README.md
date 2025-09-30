# Material 3 MCP Server

[![CI](https://github.com/weppa-cloud/material3-mcp-server/workflows/CI/badge.svg)](https://github.com/weppa-cloud/material3-mcp-server/actions)
[![npm version](https://badge.fury.io/js/@weppa-cloud%2Fmaterial3-mcp-server.svg)](https://www.npmjs.com/package/@weppa-cloud/material3-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP server providing AI agents with convenient access to Material 3 design system components, design tokens, icons, and accessibility guidelines across multiple frameworks.

## Features

- **5 Essential Tools** for Material 3 development
- **Multi-framework support**: Web Components, Flutter, React, Angular
- **Accessibility-first**: WCAG 2.1 guidelines for every component
- **Design tokens**: Export in CSS, SCSS, JSON, or JavaScript
- **Icon search**: Access to 2,500+ Material Symbols

## Installation

### NPM (Recommended)

```bash
npm install -g @weppa-cloud/material3-mcp-server
```

### From Source

```bash
git clone <repository-url>
cd material3-mcp-server
npm install
npm run build
```

## Configuration

### Claude Desktop

Edit your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add the following configuration:

```json
{
  "mcpServers": {
    "material3": {
      "command": "npx",
      "args": ["-y", "@weppa-cloud/material3-mcp-server"],
      "env": {
        "GITHUB_TOKEN": "your_github_token_optional",
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

### Cursor IDE

Add to Cursor settings (`~/.cursor/config/mcp.json`):

```json
{
  "mcpServers": {
    "material3": {
      "command": "npx",
      "args": ["-y", "@weppa-cloud/material3-mcp-server"],
      "env": {
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

## Available Tools

### 1. list_material_components

List Material 3 components with filters.

**Parameters:**
- `category` (optional): buttons, cards, chips, dialogs, lists, menus, navigation, progress, selection, sliders, text-fields, all
- `complexity` (optional): simple, medium, complex, all
- `framework` (optional): web, flutter, react, angular, all
- `includeDeprecated` (optional): boolean

**Example usage:**
```
"List all Material 3 button components"
"Show me simple components for React"
```

### 2. get_component_code

Get real source code for Material 3 components.

**Parameters:**
- `componentName`: Component name (e.g., 'button', 'card')
- `framework` (optional): web, flutter, react, angular (default: web)
- `variant` (optional): Variant name (e.g., 'filled', 'outlined')
- `includeExamples` (optional): boolean (default: true)
- `includeDependencies` (optional): boolean (default: true)

**Example usage:**
```
"Get code for a Material 3 filled button in Flutter"
"Show me the card component code for React"
```

### 3. get_design_tokens

Export Material 3 design tokens in multiple formats.

**Parameters:**
- `tokenType` (optional): color, typography, spacing, elevation, shape, motion, all
- `format` (optional): css, scss, json, javascript (default: json)
- `includeDocumentation` (optional): boolean (default: true)

**Example usage:**
```
"Get Material 3 color tokens in CSS format"
"Export all design tokens as JSON"
```

### 4. search_material_icons

Search Material Symbols icon library.

**Parameters:**
- `query`: Search query (e.g., 'home', 'settings')
- `style` (optional): outlined, rounded, sharp
- `filled` (optional): boolean
- `limit` (optional): number (max 100, default 20)

**Example usage:**
```
"Search for home icons in Material Symbols"
"Find navigation icons"
```

### 5. get_accessibility_guidelines

Get WCAG 2.1 accessibility guidelines for components.

**Parameters:**
- `componentName`: Component name
- `wcagLevel` (optional): A, AA, AAA (default: AA)
- `includeARIA` (optional): boolean (default: true)
- `includeKeyboard` (optional): boolean (default: true)

**Example usage:**
```
"What are the accessibility guidelines for Material 3 buttons?"
"Get WCAG AAA guidelines for text fields"
```

## Environment Variables

- `GITHUB_TOKEN` (optional): GitHub personal access token for higher API rate limits (5,000/hour vs 60/hour)
- `LOG_LEVEL` (optional): DEBUG, INFO, WARN, ERROR (default: INFO)

## Development

### Run in Development Mode

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Test with MCP Inspector

```bash
npm run inspector
```

This opens a web interface at http://localhost:6274 where you can test all tools interactively.

## Success Metric

**The agent can use the tools conveniently to implement features using Material 3 guidelines.**

## Testing

The server has been designed to be tested with MCP Inspector following the official MCP guidelines. All tools return structured JSON responses that can be easily consumed by AI agents.

## Architecture

```
material3-mcp-server/
├── src/
│   ├── tools/           # 5 MCP tools
│   ├── providers/       # Data providers (no cache for MVP)
│   ├── utils/           # Logger and validators
│   ├── types/           # TypeScript types
│   └── index.ts         # Entry point
├── build/               # Compiled output
└── package.json
```

## Roadmap

- [x] Real GitHub API integration for live component code ✅
- [x] Material Symbols API integration (Iconify JSON) ✅
- [x] Cache system for optimized performance ✅
- [x] Unit testing with Vitest ✅
- [x] CI/CD with GitHub Actions ✅
- [ ] Web scraping for m3.material.io documentation (optional)
- [ ] Flutter documentation integration
- [ ] Figma integration (optional)

## Release & Publishing

This project uses **automated NPM publishing** via GitHub Actions.

### For Maintainers

#### Quick Release
```bash
./scripts/release.sh 1.2.0 "New features and improvements"
```

The script will:
1. ✅ Update version in `package.json`
2. ✅ Run tests and build
3. ✅ Commit and create git tag
4. ✅ Push to GitHub
5. ✅ Create GitHub Release
6. ✅ **Trigger automatic NPM publish via GitHub Actions**

#### Manual Release
```bash
# Update version in package.json manually
git add package.json
git commit -m "chore: bump version to 1.2.0"
git tag v1.2.0
git push && git push --tags
gh release create v1.2.0 --title "v1.2.0" --notes "Release notes..."
```

### First-time Setup

To enable automatic NPM publishing, configure the `NPM_TOKEN` secret:

1. Generate NPM token: https://www.npmjs.com/settings/weppa-cloud/tokens (Automation type)
2. Add to GitHub: https://github.com/weppa-cloud/material3-mcp-server/settings/secrets/actions
3. Name: `NPM_TOKEN`, Value: your token

See [RELEASE.md](RELEASE.md) for detailed instructions.

## License

MIT

## Author

weppa-cloud

## Links

- [Material 3 Design](https://m3.material.io/)
- [Material Web Components](https://github.com/material-components/material-web)
- [Flutter Material 3](https://docs.flutter.dev/ui/design/material)
- [Material Symbols](https://fonts.google.com/icons)