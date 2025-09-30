# Cursor IDE Integration Examples

Examples for using Material 3 MCP Server with Cursor IDE.

---

## Setup

Ensure you've [configured Cursor](../docs/getting-started.md#cursor-ide) with the Material 3 MCP Server.

---

## Using in Cursor AI Chat

### Example 1: Component Exploration

Open Cursor AI Chat (`Cmd+L` or `Ctrl+L`) and ask:

```
List all Material 3 button components
```

Cursor will:
1. Invoke the `list_material_components` tool
2. Show results in the chat
3. Allow follow-up questions

---

### Example 2: Code Generation in Context

With a file open, ask:

```
Add a Material 3 elevated button to this component
```

Cursor will:
1. Analyze your current file
2. Get Material 3 button code
3. Suggest where to add it
4. Apply the code with proper imports

---

## Using with Cursor Composer

Composer (`Cmd+I` or `Ctrl+I`) provides inline code generation.

### Example: Add Component

1. Open a file
2. Press `Cmd+I`
3. Type: `Add a Material 3 card with an image`
4. Cursor fetches card code and inserts it

---

## Multi-File Workflows

### Scenario: Building a Feature

**Step 1: Create component file**
```
Cmd+L: "Show me Material 3 button code for React"
```

**Step 2: Add styles**
```
Cmd+I in styles.css: "Add Material 3 button tokens"
```

**Step 3: Find icons**
```
Cmd+L: "Find Material icons for save and cancel"
```

**Step 4: Check accessibility**
```
Cmd+L: "Review accessibility for this button"
```

---

## Tips

- Use `Cmd+K` for quick actions
- Use `Cmd+L` for chat-based queries
- Use `Cmd+I` for inline edits
- Reference files with `@filename`

---

## See Also

- [Claude Desktop Examples](./claude-desktop-usage.md)
- [Common Queries](./common-queries.md)
- [Getting Started](../docs/getting-started.md)