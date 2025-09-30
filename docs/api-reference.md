# API Reference

Complete reference documentation for all Material 3 MCP Server tools.

---

## Overview

The Material 3 MCP Server provides 5 essential tools for AI-assisted Material Design development:

| Tool | Purpose | Avg Response Time |
|------|---------|------------------|
| [`list_material_components`](#list_material_components) | List available components | 200-500ms |
| [`get_component_code`](#get_component_code) | Get component source code | 300-800ms |
| [`get_design_tokens`](#get_design_tokens) | Export design tokens | 100-300ms |
| [`search_material_icons`](#search_material_icons) | Search icon library | 200-400ms |
| [`get_accessibility_guidelines`](#get_accessibility_guidelines) | Get WCAG guidelines | 100-200ms |

---

## list_material_components

Lists available Material 3 components with optional filtering.

### Input Schema

```typescript
{
  category?: 'buttons' | 'cards' | 'chips' | 'dialogs' | 'lists' |
            'menus' | 'navigation' | 'progress' | 'selection' |
            'sliders' | 'text-fields' | 'all';
  complexity?: 'simple' | 'medium' | 'complex' | 'all';
  framework?: 'web' | 'flutter' | 'react' | 'angular' | 'all';
  includeDeprecated?: boolean;
}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `category` | enum | No | `'all'` | Filter by component category |
| `complexity` | enum | No | `'all'` | Filter by complexity level |
| `framework` | enum | No | `'all'` | Filter by framework support |
| `includeDeprecated` | boolean | No | `false` | Include deprecated components |

### Output Format

```json
{
  "components": [
    {
      "name": "button",
      "displayName": "Button",
      "category": "buttons",
      "complexity": "simple",
      "frameworks": ["web", "flutter", "react", "angular"],
      "variants": ["filled", "outlined", "text", "elevated", "tonal"],
      "description": "Buttons help people initiate actions...",
      "documentationUrl": "https://m3.material.io/components/buttons",
      "deprecated": false
    }
  ],
  "total": 42,
  "filters": {
    "category": "all",
    "complexity": "all",
    "framework": "all"
  }
}
```

### Examples

**List all components:**
```json
// Input
{}

// Output
{ "components": [...], "total": 42 }
```

**List button components:**
```json
// Input
{ "category": "buttons" }

// Output
{ "components": [button, fab, icon-button, segmented-button], "total": 4 }
```

**List simple React components:**
```json
// Input
{ "complexity": "simple", "framework": "react" }

// Output
{ "components": [...15 components], "total": 15 }
```

### Error Responses

See [Error Handling](#error-handling) section.

---

## get_component_code

Retrieves real source code and examples for a specific Material 3 component.

### Input Schema

```typescript
{
  componentName: string;              // Required
  framework?: 'web' | 'flutter' | 'react' | 'angular';
  variant?: string;                   // e.g., 'filled', 'outlined'
  includeExamples?: boolean;
  includeDependencies?: boolean;
}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `componentName` | string | **Yes** | - | Component name (e.g., 'button', 'card') |
| `framework` | enum | No | `'web'` | Target framework |
| `variant` | string | No | - | Specific variant (e.g., 'filled', 'outlined') |
| `includeExamples` | boolean | No | `true` | Include usage examples |
| `includeDependencies` | boolean | No | `true` | Include dependency information |

### Output Format

```json
{
  "component": "button",
  "framework": "web",
  "variant": "filled",
  "sourceCode": "export class MdFilledButton extends Button {...}",
  "examples": [
    {
      "title": "Basic Button",
      "code": "<md-filled-button>Click me</md-filled-button>",
      "description": "Standard filled button"
    }
  ],
  "dependencies": ["@material/web"],
  "imports": ["import '@material/web/button/filled-button.js';"],
  "cssVariables": ["--md-filled-button-container-color", "..."],
  "documentation": "https://m3.material.io/components/buttons",
  "availableVariants": ["filled", "outlined", "text", "elevated", "tonal"]
}
```

### Examples

**Get button code for Web:**
```json
// Input
{ "componentName": "button", "framework": "web" }

// Returns Web Components code with examples
```

**Get filled button in Flutter:**
```json
// Input
{ "componentName": "button", "framework": "flutter", "variant": "filled" }

// Returns Flutter FilledButton code
```

**Get card code without examples:**
```json
// Input
{ "componentName": "card", "includeExamples": false }

// Returns card source code only
```

---

## get_design_tokens

Exports Material 3 design tokens in multiple formats.

### Input Schema

```typescript
{
  tokenType?: 'color' | 'typography' | 'spacing' |
              'elevation' | 'shape' | 'motion' | 'all';
  format?: 'css' | 'scss' | 'json' | 'javascript';
  includeDocumentation?: boolean;
}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `tokenType` | enum | No | `'all'` | Type of design tokens |
| `format` | enum | No | `'json'` | Output format |
| `includeDocumentation` | boolean | No | `true` | Include token descriptions |

### Output Format

```json
{
  "tokenType": "color",
  "format": "json",
  "tokens": {
    "md.sys.color.primary": {
      "value": "#6750A4",
      "type": "color",
      "description": "High-emphasis primary color"
    },
    "md.sys.color.on-primary": {
      "value": "#FFFFFF",
      "type": "color",
      "description": "Text/icons on primary"
    }
  },
  "cssOutput": ":root { --md-sys-color-primary: #6750A4; }",
  "documentation": "https://m3.material.io/foundations/design-tokens"
}
```

### Examples

**Get color tokens in CSS:**
```json
// Input
{ "tokenType": "color", "format": "css" }

// Returns CSS custom properties
```

**Get all tokens in JSON:**
```json
// Input
{ "tokenType": "all", "format": "json" }

// Returns complete token set
```

**Get typography tokens in SCSS:**
```json
// Input
{ "tokenType": "typography", "format": "scss" }

// Returns SCSS variables
```

---

## search_material_icons

Searches the Material Symbols icon library.

### Input Schema

```typescript
{
  query: string;                      // Required
  style?: 'outlined' | 'rounded' | 'sharp';
  filled?: boolean;
  limit?: number;                     // max 100
}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | **Yes** | - | Search query (e.g., 'home', 'settings') |
| `style` | enum | No | - | Icon style variant |
| `filled` | boolean | No | `false` | Use filled variant |
| `limit` | number | No | `20` | Max results (1-100) |

### Output Format

```json
{
  "query": "home",
  "results": [
    {
      "name": "home",
      "codepoint": "e88a",
      "categories": ["action"],
      "tags": ["house", "main", "homepage"],
      "usage": {
        "web": "<span class='material-symbols-outlined'>home</span>",
        "flutter": "Icon(Icons.home)",
        "react": "<Icon>home</Icon>",
        "css": "content: '\\e88a';"
      }
    }
  ],
  "total": 15,
  "style": "outlined",
  "downloadUrl": "https://fonts.google.com/icons"
}
```

### Examples

**Search for home icons:**
```json
// Input
{ "query": "home" }

// Returns home-related icons
```

**Search rounded navigation icons:**
```json
// Input
{ "query": "navigation", "style": "rounded", "limit": 10 }

// Returns 10 rounded navigation icons
```

---

## get_accessibility_guidelines

Gets WCAG 2.1 accessibility guidelines for a specific component.

### Input Schema

```typescript
{
  componentName: string;              // Required
  wcagLevel?: 'A' | 'AA' | 'AAA';
  includeARIA?: boolean;
  includeKeyboard?: boolean;
}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `componentName` | string | **Yes** | - | Component name |
| `wcagLevel` | enum | No | `'AA'` | WCAG conformance level |
| `includeARIA` | boolean | No | `true` | Include ARIA attributes |
| `includeKeyboard` | boolean | No | `true` | Include keyboard support |

### Output Format

```json
{
  "component": "button",
  "wcagLevel": "AA",
  "guidelines": [
    {
      "criterion": "1.4.3 Contrast (Minimum)",
      "level": "AA",
      "requirement": "Text contrast ratio minimum 4.5:1",
      "implementation": "Use md-sys-color tokens"
    }
  ],
  "ariaAttributes": {
    "required": ["Accessible name"],
    "optional": ["aria-describedby", "aria-controls"],
    "states": ["aria-pressed", "aria-disabled"]
  },
  "keyboardSupport": {
    "Enter": "Activates the button",
    "Space": "Activates the button",
    "Tab": "Moves focus to/from button"
  },
  "bestPractices": [
    "Ensure button has descriptive text",
    "Provide visual focus indicator",
    "Minimum touch target 48x48dp"
  ]
}
```

### Examples

**Get button accessibility guidelines:**
```json
// Input
{ "componentName": "button" }

// Returns WCAG AA guidelines for buttons
```

**Get AAA guidelines for text fields:**
```json
// Input
{ "componentName": "text-field", "wcagLevel": "AAA" }

// Returns WCAG AAA guidelines
```

---

## Error Handling

All tools return consistent error responses with actionable solutions.

### Error Response Format

```json
{
  "content": [{
    "type": "text",
    "text": "❌ [Error message]\n\n💡 Suggested solution:\n[Specific solution]\n\n📚 More information:\n[Documentation link]"
  }],
  "isError": true
}
```

### Common Errors

#### Network Errors

```
❌ Network connection failed

💡 Suggested solution:
Check your internet connection and firewall settings.

📚 More information:
https://github.com/weppa-cloud/material3-mcp-server/blob/main/docs/troubleshooting.md#network-errors
```

#### Rate Limit Errors

```
❌ GitHub API rate limit exceeded

💡 Suggested solution:
Set GITHUB_TOKEN environment variable for higher rate limits.

📚 More information:
https://github.com/weppa-cloud/material3-mcp-server/blob/main/docs/troubleshooting.md#rate-limits
```

#### Validation Errors

```
❌ Invalid input parameters

💡 Suggested solution:
Validation errors: category: Invalid enum value. Expected 'buttons', received 'button'

📚 More information:
https://github.com/weppa-cloud/material3-mcp-server/blob/main/docs/api-reference.md#list_material_components
```

#### Resource Not Found

```
❌ Resource not found

💡 Suggested solution:
Component 'xyz' may not exist. Use list_material_components to see available components.

📚 More information:
https://github.com/weppa-cloud/material3-mcp-server/blob/main/docs/api-reference.md#available-components
```

---

## Framework Support Matrix

| Component | Web | Flutter | React | Angular |
|-----------|-----|---------|-------|---------|
| Button | ✅ Full | ✅ Full | ⚠️ Partial | ⚠️ Partial |
| FAB | ✅ Full | ✅ Full | ⚠️ Partial | ⚠️ Partial |
| Card | ✅ Full | ✅ Full | ⚠️ Partial | ⚠️ Partial |
| Chip | ✅ Full | ✅ Full | ⚠️ Partial | ⚠️ Partial |
| Dialog | ✅ Full | ✅ Full | ⚠️ Partial | ⚠️ Partial |
| Text Field | ✅ Full | ✅ Full | ⚠️ Partial | ⚠️ Partial |

**Legend:**
- ✅ **Full:** Official Material 3 implementation
- ⚠️ **Partial:** Community wrappers/ports available
- ❌ **None:** Not available

---

## Material 3 Component Categories

### Actions
- **button** - Buttons for initiating actions
- **fab** - Floating Action Button
- **icon-button** - Icon-only buttons
- **segmented-button** - Segmented button group

### Communication
- **badge** - Notification badges
- **progress-indicator** - Progress bars and spinners
- **snackbar** - Brief messages

### Containment
- **card** - Elevated content containers
- **divider** - Content separators
- **list** - Vertical lists
- **carousel** - Horizontal scrolling content

### Navigation
- **navigation-bar** - Bottom navigation
- **navigation-drawer** - Side navigation
- **tabs** - Content tabs
- **top-app-bar** - Top app bar
- **search** - Search bar

### Selection
- **checkbox** - Multi-selection
- **chip** - Compact selections
- **radio** - Single selection
- **slider** - Range selection
- **switch** - On/off toggle

### Text Input
- **text-field** - Text input fields
- **autocomplete** - Auto-completing input

---

## Rate Limits and Performance

### GitHub API Rate Limits

- **Without token:** 60 requests/hour
- **With token:** 5,000 requests/hour

**Set token to avoid limits:**
```json
{
  "env": {
    "GITHUB_TOKEN": "ghp_YOUR_TOKEN_HERE"
  }
}
```

### Cache Behavior

| Operation | Cache Duration | Notes |
|-----------|---------------|-------|
| Component list | 1 hour | Rarely changes |
| Component code | 1 hour | From GitHub API |
| Design tokens | 24 hours | Static data |
| Icon search | 24 hours | Static icon library |
| Accessibility | 24 hours | Static guidelines |

### Performance Characteristics

| Tool | Avg Time | Max Time | Caching |
|------|----------|----------|---------|
| list_material_components | 200ms | 500ms | ✅ Yes |
| get_component_code | 300ms | 800ms | ✅ Yes |
| get_design_tokens | 100ms | 300ms | ✅ Yes |
| search_material_icons | 200ms | 400ms | ✅ Yes |
| get_accessibility_guidelines | 100ms | 200ms | ✅ Yes |

---

## Version Compatibility

### MCP Protocol
- **Required:** MCP SDK 1.18.1+
- **Tested:** 1.18.1 - 1.20.0

### Node.js
- **Minimum:** 18.0.0
- **Recommended:** 20.x LTS
- **Tested:** 18.19.0, 20.10.0, 21.5.0

### AI Hosts
- **Claude Desktop:** 1.0.0+
- **Cursor:** 0.35.0+
- **VS Code + Continue:** Continue 0.8.0+

---

## See Also

- [Getting Started Guide](./getting-started.md)
- [Troubleshooting](./troubleshooting.md)
- [Usage Examples](./examples.md)
- [GitHub Repository](https://github.com/weppa-cloud/material3-mcp-server)
- [NPM Package](https://www.npmjs.com/package/@weppa-cloud/material3-mcp-server)