# Material 3 MCP Server

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

- [ ] Real GitHub API integration for live component code
- [ ] Web scraping for m3.material.io documentation
- [ ] Material Symbols API integration
- [ ] Cache system for optimized performance
- [ ] Flutter documentation integration
- [ ] Figma integration (optional)

## License

MIT

## Author

weppa-cloud

## Links

- [Material 3 Design](https://m3.material.io/)
- [Material Web Components](https://github.com/material-components/material-web)
- [Flutter Material 3](https://docs.flutter.dev/ui/design/material)
- [Material Symbols](https://fonts.google.com/icons)