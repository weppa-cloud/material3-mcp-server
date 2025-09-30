# Usage Examples

Real-world examples and workflows for the Material 3 MCP Server.

---

## Table of Contents

1. [Basic Examples](#basic-examples)
2. [Framework-Specific Examples](#framework-specific-examples)
3. [Multi-Tool Workflows](#multi-tool-workflows)
4. [Advanced Use Cases](#advanced-use-cases)
5. [Best Practices](#best-practices)

---

## Basic Examples

### Example 1: Exploring Components

**Goal:** Discover available Material 3 components

**Prompt:**
```
Show me all Material 3 button components
```

**Expected Response:**
- Tool: `list_material_components`
- Returns: button, fab, icon-button, segmented-button
- With variants, frameworks, and documentation links

**Follow-up:**
```
Now show me all navigation components
```

---

### Example 2: Getting Component Code

**Goal:** Get implementation code for a component

**Prompt:**
```
I need the code for a Material 3 filled button in Web Components
```

**Expected Response:**
- Tool: `get_component_code`
- Returns: Web Components code
- Includes: imports, examples, CSS variables

**Follow-up:**
```
Show me the same button but in Flutter
```

---

### Example 3: Icon Search

**Goal:** Find appropriate icons

**Prompt:**
```
Find Material icons for navigation menu
```

**Expected Response:**
- Tool: `search_material_icons`
- Returns: menu, menu_open, navigation, apps, etc.
- With usage code for each framework

---

### Example 4: Design Tokens

**Goal:** Get design system tokens

**Prompt:**
```
Give me all Material 3 color tokens in CSS format
```

**Expected Response:**
- Tool: `get_design_tokens`
- Returns: CSS custom properties
- Includes: all color tokens with values

---

### Example 5: Accessibility Check

**Goal:** Ensure accessible implementation

**Prompt:**
```
What are the accessibility requirements for Material 3 text fields?
```

**Expected Response:**
- Tool: `get_accessibility_guidelines`
- Returns: WCAG guidelines, ARIA attributes, keyboard support
- Includes: best practices and implementation tips

---

## Framework-Specific Examples

### Web Components Workflow

**Scenario:** Building a Web Components app with Material 3

**Step 1: Explore components**
```
List all Material 3 components available for Web Components
```

**Step 2: Get button implementation**
```
Show me how to implement a Material 3 elevated button in Web Components
```

**Step 3: Add icons**
```
Find icons for "add" and "remove" actions
```

**Step 4: Get theme tokens**
```
Export Material 3 design tokens in CSS format
```

**Step 5: Check accessibility**
```
What accessibility guidelines should I follow for the button?
```

**Result:** Complete Material 3 implementation with proper tokens and accessibility

---

### Flutter Workflow

**Scenario:** Creating a Flutter app with Material 3

**Step 1: Check Flutter support**
```
List all Material 3 components available for Flutter
```

**Step 2: Get button code**
```
Show me Flutter code for a FilledButton with an icon
```

**Expected code:**
```dart
import 'package:flutter/material.dart';

FilledButton.icon(
  onPressed: () {},
  icon: Icon(Icons.favorite),
  label: Text('Like'),
)
```

**Step 3: Get design tokens**
```
Give me Material 3 color tokens for Flutter
```

**Step 4: Implement navigation**
```
Show me how to create a Material 3 navigation bar in Flutter
```

---

### React Workflow

**Scenario:** Using Material 3 with React (community wrappers)

**Step 1: Explore options**
```
What Material 3 components are available for React?
```

**Step 2: Get component code**
```
Show me a Material 3 card implementation for React
```

**Step 3: Add theming**
```
How do I apply Material 3 design tokens in React?
```

**Step 4: Icon integration**
```
Find navigation icons and show React usage
```

---

### Angular Workflow

**Scenario:** Angular app with Material 3

**Step 1: Check availability**
```
List Material 3 components for Angular
```

**Step 2: Get form components**
```
Show me Material 3 text field code for Angular
```

**Step 3: Design system**
```
Export Material 3 typography tokens in SCSS format for Angular
```

---

## Multi-Tool Workflows

### Workflow 1: Building a Complete Page

**Goal:** Create a Material 3 profile page

**Step 1: Layout components**
```
List Material 3 components for cards, buttons, and avatars
```

**Step 2: Get card code**
```
Show me a Material 3 card with image support
```

**Step 3: Add action buttons**
```
Get code for outlined and filled buttons
```

**Step 4: Find icons**
```
Search for icons: edit, share, favorite
```

**Step 5: Apply design tokens**
```
Get elevation and spacing tokens in CSS
```

**Step 6: Accessibility check**
```
What are the accessibility requirements for this layout?
```

**Result:** Complete, accessible profile page with Material 3 design

---

### Workflow 2: Themed Component Library

**Goal:** Create custom themed Material 3 components

**Step 1: Get base components**
```
List all Material 3 button variants
```

**Step 2: Extract design tokens**
```
Export all Material 3 design tokens in JSON format
```

**Step 3: Customize colors**
```
Show me the color token structure for primary and secondary colors
```

**Step 4: Get component anatomy**
```
What CSS variables does the button component use?
```

**Step 5: Implement custom theme**
- Override CSS custom properties
- Apply to components
- Test in different states

**Result:** Fully themed Material 3 component library

---

### Workflow 3: Migration from Material 2

**Goal:** Migrate existing app from Material 2 to Material 3

**Step 1: Compare components**
```
List Material 3 equivalents for my Material 2 components
```

**Step 2: Check breaking changes**
```
What changed between Material 2 and Material 3 buttons?
```

**Step 3: Update design tokens**
```
Get Material 3 color tokens and compare with Material 2
```

**Step 4: Update accessibility**
```
What new accessibility features does Material 3 have?
```

**Step 5: Migrate component by component**
```
Show me Material 3 code for each component I need to migrate
```

**Result:** Successful migration to Material 3

---

### Workflow 4: Accessible Form Implementation

**Goal:** Build WCAG AA compliant form

**Step 1: Get form components**
```
List Material 3 text input and selection components
```

**Step 2: Check accessibility for each**
```
What are WCAG AA requirements for text fields?
What are WCAG AA requirements for checkboxes?
What are WCAG AA requirements for buttons?
```

**Step 3: Get implementation code**
```
Show me accessible text field code with proper ARIA attributes
Show me accessible checkbox with labels
Show me accessible submit button
```

**Step 4: Find appropriate icons**
```
Search for form icons: error, success, info
```

**Step 5: Apply color tokens**
```
Get color tokens that meet contrast requirements
```

**Result:** Fully accessible, WCAG AA compliant form

---

## Advanced Use Cases

### Use Case 1: Custom Theme Generation

**Scenario:** Create a branded Material 3 theme

**Approach:**
1. Get base design tokens
2. Identify customizable tokens
3. Generate custom color palette
4. Apply to components
5. Test contrast ratios

**Example prompts:**
```
Export all Material 3 color tokens
What color tokens should I customize for branding?
Show me how to override primary color tokens
Get contrast checking guidelines for custom colors
```

---

### Use Case 2: Component Library Documentation

**Scenario:** Generate documentation for your component library

**Approach:**
1. List all components
2. Get code examples for each
3. Extract accessibility requirements
4. Generate token reference
5. Create usage guidelines

**Example prompts:**
```
List all Material 3 components with descriptions
Get examples for each button variant
What are the accessibility guidelines for each component?
Export design tokens with documentation
```

---

### Use Case 3: Design System Audit

**Scenario:** Verify Material 3 compliance

**Approach:**
1. Check component coverage
2. Verify design token usage
3. Audit accessibility
4. Document deviations
5. Plan improvements

**Example prompts:**
```
List all Material 3 components we should implement
What design tokens are we missing?
Check accessibility compliance for each component
What are Material 3 best practices we're not following?
```

---

### Use Case 4: Rapid Prototyping

**Scenario:** Quickly prototype Material 3 UI

**Approach:**
1. Explore components
2. Get implementation code
3. Find icons quickly
4. Apply design tokens
5. Iterate rapidly

**Example prompts:**
```
What components do I need for a dashboard?
Get code for app bar, nav drawer, and cards
Find dashboard icons
Apply Material 3 spacing and elevation
```

---

## Best Practices

### Prompt Engineering Tips

**Be specific about framework:**
```
✅ "Show me Material 3 button in Flutter"
❌ "Show me Material 3 button" (defaults to Web)
```

**Ask for variants explicitly:**
```
✅ "Show me all button variants: filled, outlined, text"
❌ "Show me buttons" (returns one variant)
```

**Specify output format for tokens:**
```
✅ "Export color tokens in SCSS format"
❌ "Export color tokens" (defaults to JSON)
```

**Request accessibility level:**
```
✅ "What are WCAG AAA requirements for buttons?"
❌ "What are accessibility requirements?" (defaults to AA)
```

---

### Workflow Optimization

**1. Start broad, then narrow:**
```
1. "List all Material 3 navigation components"
2. "Show me the navigation bar component"
3. "Get code for navigation bar with icons"
```

**2. Chain related queries:**
```
1. "Get button code"
2. "Find an icon for this button"
3. "Check accessibility for button with icon"
```

**3. Use context from previous responses:**
```
1. AI returns button with variant="filled"
2. "Now show me the outlined variant"
3. AI understands you mean button
```

---

### Component Selection Guide

**For simple actions:**
- Use `button` or `icon-button`

**For primary actions:**
- Use `fab` (Floating Action Button)

**For navigation:**
- Use `navigation-bar`, `navigation-drawer`, or `tabs`

**For data display:**
- Use `card`, `list`, or `data-table`

**For user input:**
- Use `text-field`, `checkbox`, `radio`, `switch`, `slider`

**For feedback:**
- Use `snackbar`, `progress-indicator`, `badge`

---

### Design Token Usage

**Always use tokens instead of hard-coded values:**

```css
/* ❌ Don't */
.button {
  background-color: #6750A4;
  border-radius: 20px;
  padding: 10px 24px;
}

/* ✅ Do */
.button {
  background-color: var(--md-sys-color-primary);
  border-radius: var(--md-sys-shape-corner-full);
  padding: var(--md-sys-spacing-2) var(--md-sys-spacing-6);
}
```

**Get tokens from the server:**
```
Export Material 3 design tokens in CSS format
```

---

### Accessibility Checklist

For every component, verify:

1. **Color Contrast**
   - Check with: "What are contrast requirements for [component]?"
   - Minimum 4.5:1 for normal text (WCAG AA)

2. **Keyboard Support**
   - Check with: "What keyboard shortcuts does [component] support?"
   - Ensure Tab, Enter, Space, Arrow keys work

3. **ARIA Attributes**
   - Check with: "What ARIA attributes are required for [component]?"
   - Add all required attributes

4. **Focus Management**
   - Visible focus indicators
   - Logical focus order
   - No focus traps

5. **Screen Reader Support**
   - Meaningful labels
   - Status announcements
   - Helper text

---

### Testing Your Implementation

**1. Visual Testing:**
- Compare with Material 3 guidelines
- Test all variants and states
- Verify responsive behavior

**2. Accessibility Testing:**
- Use automated tools (axe, WAVE)
- Manual keyboard navigation
- Screen reader testing

**3. Cross-browser Testing:**
- Chrome, Firefox, Safari, Edge
- Mobile browsers
- Different OS platforms

**4. Performance Testing:**
- Check load times
- Verify proper caching
- Monitor API rate limits

---

## See Also

- [API Reference](./api-reference.md) - Complete tool documentation
- [Getting Started](./getting-started.md) - Installation and setup
- [Troubleshooting](./troubleshooting.md) - Common issues
- [Claude Desktop Examples](../examples/claude-desktop-usage.md) - Platform-specific examples
- [Cursor Examples](../examples/cursor-integration.md) - IDE integration examples
- [Common Queries](../examples/common-queries.md) - Quick reference queries