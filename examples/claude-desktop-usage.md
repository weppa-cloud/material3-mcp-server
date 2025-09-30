# Claude Desktop Usage Examples

Practical examples for using Material 3 MCP Server with Claude Desktop.

---

## Quick Start

After [installing and configuring](../docs/getting-started.md#claude-desktop) the server, try these examples in Claude Desktop.

---

## Example Queries

### 1. Component Discovery

**Query:**
```
List all Material 3 button components with their variants
```

**What happens:**
- Claude invokes `list_material_components` with `category: 'buttons'`
- Returns: button, fab, icon-button, segmented-button
- Shows variants for each (filled, outlined, text, etc.)

**Follow-up questions:**
```
Show me navigation components
What selection components are available?
```

---

### 2. Get Implementation Code

**Query:**
```
I'm building a web app. Show me how to use a Material 3 elevated button
```

**What happens:**
- Claude invokes `get_component_code`
- Parameters: `{ componentName: 'button', framework: 'web', variant: 'elevated' }`
- Returns code with examples and imports

**Claude's response includes:**
- Import statement
- HTML usage
- Example with icon
- CSS variables used
- Documentation link

---

### 3. Icon Search

**Query:**
```
I need icons for a settings page - find me relevant Material icons
```

**What happens:**
- Claude invokes `search_material_icons` with `query: 'settings'`
- Returns multiple setting-related icons
- Provides usage code for each

**Follow-up:**
```
Show me these icons in the rounded style
Find icons for navigation
```

---

### 4. Design Tokens

**Query:**
```
I need Material 3 color tokens for my CSS file
```

**What happens:**
- Claude invokes `get_design_tokens`
- Parameters: `{ tokenType: 'color', format: 'css' }`
- Returns CSS custom properties

**Claude can then:**
- Explain how to use the tokens
- Show examples of applying them
- Suggest color combinations

---

### 5. Accessibility Guidance

**Query:**
```
I'm implementing a text field. What accessibility requirements should I follow?
```

**What happens:**
- Claude invokes `get_accessibility_guidelines`
- Parameters: `{ componentName: 'text-field', wcagLevel: 'AA' }`
- Returns WCAG guidelines, ARIA attributes, keyboard support

**Claude provides:**
- Specific WCAG criteria
- Required ARIA attributes
- Keyboard interaction patterns
- Best practices
- Code examples with proper attributes

---

## Real-World Scenarios

### Scenario 1: Building a Dashboard

**Your goal:** Create a Material 3 dashboard with cards and navigation

**Conversation flow:**

**You:**
```
I'm building a dashboard with Material 3. What components should I use?
```

**Claude:** _(Uses `list_material_components`)_
"Based on Material 3 components, here's what I recommend for a dashboard:
- App bar (top-app-bar) for the header
- Navigation drawer for side navigation
- Cards for content sections
- FAB for primary action

Would you like code for any of these?"

**You:**
```
Yes, show me how to implement the app bar and cards
```

**Claude:** _(Uses `get_component_code` twice)_
Returns code for both components with examples

**You:**
```
What icons should I use for the navigation menu?
```

**Claude:** _(Uses `search_material_icons`)_
Suggests: dashboard, analytics, settings, notifications icons

**You:**
```
Make sure these components are accessible
```

**Claude:** _(Uses `get_accessibility_guidelines`)_
Provides accessibility requirements for each component

---

### Scenario 2: Theming an Application

**Your goal:** Apply custom colors while maintaining Material 3 design

**Conversation flow:**

**You:**
```
How do I customize Material 3 colors for my brand?
```

**Claude:** _(Uses `get_design_tokens`)_
"Material 3 uses design tokens. Here are the color tokens you can customize:
[Shows tokens]

To customize, override these CSS variables..."

**You:**
```
Show me the tokens in SCSS format
```

**Claude:** _(Uses `get_design_tokens` with format: 'scss')_
Returns SCSS variables

**You:**
```
What color contrast ratios do I need to maintain?
```

**Claude:** _(Uses `get_accessibility_guidelines`)_
Explains WCAG contrast requirements and how to check them

---

### Scenario 3: Migrating from Another UI Framework

**Your goal:** Learn Material 3 components

**Conversation flow:**

**You:**
```
I'm coming from Bootstrap. What are the Material 3 equivalents?
```

**Claude:** _(Uses `list_material_components`)_
"Here's a comparison:
- Bootstrap buttons → Material 3 buttons (more variants)
- Bootstrap cards → Material 3 cards (elevation-based)
- Bootstrap modals → Material 3 dialogs
..."

**You:**
```
Show me Material 3 button code
```

**Claude:** _(Uses `get_component_code`)_
Provides complete button implementation

**You:**
```
How is this different from Bootstrap buttons in terms of accessibility?
```

**Claude:** _(Uses `get_accessibility_guidelines`)_
Explains Material 3 built-in accessibility features

---

## Advanced Usage

### Multi-Step Workflow

**Goal:** Implement a complete feature with multiple components

**Example: Creating a form with validation**

```
Step 1: "What Material 3 components do I need for a form?"
→ Claude lists: text-field, checkbox, button, snackbar

Step 2: "Show me accessible text field code with error handling"
→ Claude provides code with ARIA attributes

Step 3: "Find icons for form validation (success, error, warning)"
→ Claude searches and returns appropriate icons

Step 4: "Get the color tokens for error and success states"
→ Claude provides color tokens with contrast-safe values

Step 5: "Show me how to implement the submit button"
→ Claude provides button code with loading state

Step 6: "Make sure this entire form is WCAG AA compliant"
→ Claude checks all components and provides accessibility guidance
```

---

### Contextual Assistance

Claude remembers context within a conversation:

**You:**
```
Show me a Material 3 card component
```

**Claude:** _(Shows card code)_

**You:**
```
Add a button to it
```

**Claude:** _(Adds button to the existing card code, maintains context)_

**You:**
```
Make it accessible
```

**Claude:** _(Adds ARIA attributes and checks accessibility for the card+button combination)_

---

## Tips for Effective Use

### Be Specific About Your Framework

```
✅ "Show me Material 3 button in Flutter"
✅ "I need Web Components code for a card"
✅ "React implementation of Material 3 chip"
```

### Ask Follow-Up Questions

After receiving component code:
```
- "What CSS variables can I customize?"
- "Show me different variants"
- "How do I add an icon?"
- "What's the accessibility checklist?"
```

### Request Complete Implementations

```
"Show me a complete example of:
- A Material 3 app bar
- With navigation icons
- Proper color tokens
- WCAG AA compliant"
```

### Combine Multiple Queries

```
"I need to implement a Material 3 navigation drawer:
1. Show me the code
2. Find appropriate icons
3. Get the elevation tokens
4. Check accessibility requirements"
```

---

## Troubleshooting in Claude Desktop

### If tools aren't working:

**Check 1: Verify server is loaded**
- Look for "Material 3 MCP Server" in Claude's MCP servers list
- Usually shown in bottom left or settings

**Check 2: Ask explicitly**
```
"Use the Material 3 MCP server to list button components"
```

**Check 3: Restart Claude Desktop**
- Quit completely (⌘+Q on macOS)
- Reopen
- Try again

**Check 4: Review logs**
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

### If getting rate limit errors:

**Add GitHub token to configuration** (see [Getting Started](../docs/getting-started.md#github-token-recommended))

---

## Keyboard Shortcuts

While using Claude Desktop:

- **⌘+K** (Mac) / **Ctrl+K** (Windows): New conversation
- **⌘+L** (Mac) / **Ctrl+L** (Windows): Clear conversation
- **⌘+/**: Show keyboard shortcuts
- **↑**: Edit last message

---

## Example Prompts Collection

### Component Exploration
```
"List all Material 3 action components"
"Show me components for data display"
"What input components are available?"
```

### Code Generation
```
"Generate a Material 3 sign-in form with email and password fields"
"Create a responsive card layout using Material 3"
"Show me a navigation drawer with icons and labels"
```

### Design Tokens
```
"Export all Material 3 typography tokens"
"Get spacing values for consistent layouts"
"Show me the elevation scale"
```

### Accessibility
```
"Review accessibility for my text field implementation"
"What ARIA roles do Material 3 dialogs use?"
"Check color contrast for my custom theme"
```

### Icons
```
"Find icons for: home, search, profile, settings"
"Show me all communication icons"
"What icon should I use for a delete action?"
```

---

## See Also

- [Getting Started Guide](../docs/getting-started.md)
- [Cursor Integration Examples](./cursor-integration.md)
- [Common Queries Reference](./common-queries.md)
- [API Reference](../docs/api-reference.md)
- [Troubleshooting](../docs/troubleshooting.md)