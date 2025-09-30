# Getting Started with Material 3 MCP Server

**Estimated completion time:** < 5 minutes

This guide will walk you through installing, configuring, and using the Material 3 MCP Server with your AI coding assistant.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Verification](#verification)
5. [First Usage](#first-usage)
6. [Optional Configuration](#optional-configuration)
7. [Troubleshooting Quick Fixes](#troubleshooting-quick-fixes)
8. [Next Steps](#next-steps)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** version 18.0.0 or higher
  ```bash
  node --version  # Should show v18.0.0 or higher
  ```

- **One of the following AI hosts:**
  - Claude Desktop (recommended)
  - Cursor IDE
  - VS Code with Continue extension

- **Basic command line familiarity**

---

## Installation

Choose one of the following installation methods:

### Option 1: NPX (Recommended for AI Hosts)

**No installation required!** The server runs via npx when called by your AI host.

This is the recommended approach for Claude Desktop and Cursor IDE configuration.

**Verification:**
```bash
npx @weppa-cloud/material3-mcp-server --version
```

**Expected output:** `1.2.0` (or current version)

---

### Option 2: Global Installation

Install globally for command-line access:

```bash
npm install -g @weppa-cloud/material3-mcp-server
```

**Verification:**
```bash
material3-mcp --version
```

**Expected output:** `1.2.0`

---

### Option 3: From Source (For Development)

Clone and build from source:

```bash
git clone https://github.com/weppa-cloud/material3-mcp-server.git
cd material3-mcp-server
npm install
npm run build
```

**Verification:**
```bash
npm test
npm run inspector  # Opens http://localhost:6274
```

---

## Configuration

### Claude Desktop

**Step 1: Locate your configuration file**

The file location depends on your operating system:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

**Step 2: Edit the configuration**

Open the file in your preferred text editor and add the following:

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

**If you already have other MCP servers configured**, add the `material3` entry to the existing `mcpServers` object:

```json
{
  "mcpServers": {
    "existing-server": {
      "command": "...",
      "args": ["..."]
    },
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

**Step 3: Restart Claude Desktop**

- **macOS/Linux:** Quit completely (⌘+Q or Ctrl+Q) and reopen
- **Windows:** Quit from system tray and reopen

**Step 4: Verify the server is loaded**

In Claude Desktop, you should see the Material 3 MCP server listed in the MCP servers menu (usually in the bottom left corner or settings).

---

### Cursor IDE

**Step 1: Create or edit the configuration file**

The file location:
- **All platforms:** `~/.cursor/config/mcp.json`

**Step 2: Add the server configuration**

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

**Step 3: Reload Cursor**

- Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
- Type "Reload Window" and press Enter

**Step 4: Verify the server is loaded**

Open Cursor AI Chat and type:
```
Can you list Material 3 button components?
```

The AI should use the `list_material_components` tool to respond.

---

### VS Code with Continue

**Step 1: Install Continue extension**

Search for "Continue" in VS Code extensions and install it.

**Step 2: Edit Continue configuration**

Open Continue settings and add to the MCP servers section:

```json
{
  "mcpServers": {
    "material3": {
      "command": "npx",
      "args": ["-y", "@weppa-cloud/material3-mcp-server"]
    }
  }
}
```

**Step 3: Reload VS Code**

Press `Cmd+Shift+P` / `Ctrl+Shift+P` → "Reload Window"

---

## Verification

### Automated Verification

Run the package validation script:

```bash
cd material3-mcp-server
./scripts/test-package.sh
```

**Expected output:**
```
🔍 Material 3 MCP Server - Package Validation
==============================================

📦 Test 1: Verifying NPM installation...
✅ NPM package installed successfully

🔧 Test 2: Checking executable...
✅ Executable 'material3-mcp' is available

🌐 Test 3: Testing MCP protocol...
✅ MCP server starts successfully

📝 Test 4: Validating configuration examples...
✅ Configuration JSON is valid

📚 Test 5: Checking documentation...
✅ NPM package documentation is accessible

==============================================
✅ All validation tests passed!
```

---

### Manual Verification

**Test in Claude Desktop or Cursor:**

Ask the AI assistant:
```
List all Material 3 button components
```

**Expected behavior:**
- The AI invokes the `list_material_components` tool
- Returns a list of button components (button, fab, icon-button, segmented-button)
- Provides component details (variants, frameworks, description)

**If you see an error**, proceed to [Troubleshooting Quick Fixes](#troubleshooting-quick-fixes).

---

## First Usage

Here are some example prompts to try with your AI assistant:

### Example 1: List Components
```
List all Material 3 button components
```

**What happens:**
- Tool used: `list_material_components`
- Returns: Button, FAB, Icon Button, Segmented Button

---

### Example 2: Get Component Code
```
Show me the code for a Material 3 filled button in Flutter
```

**What happens:**
- Tool used: `get_component_code`
- Returns: Flutter code with examples and imports

---

### Example 3: Search Icons
```
Find Material icons for navigation
```

**What happens:**
- Tool used: `search_material_icons`
- Returns: Navigation-related icons with usage code

---

### Example 4: Design Tokens
```
Get Material 3 color tokens in CSS format
```

**What happens:**
- Tool used: `get_design_tokens`
- Returns: CSS variables for Material 3 colors

---

### Example 5: Accessibility
```
What are the accessibility guidelines for Material 3 buttons?
```

**What happens:**
- Tool used: `get_accessibility_guidelines`
- Returns: WCAG guidelines, ARIA attributes, keyboard support

---

## Optional Configuration

### GitHub Token (Recommended)

Setting a GitHub token increases API rate limits from 60 to 5,000 requests per hour.

**Step 1: Create a GitHub Personal Access Token**

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: `material3-mcp-server`
4. Scopes: Select `public_repo` (or no scopes for public data only)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)

**Step 2: Add to configuration**

Update your AI host configuration file:

```json
{
  "mcpServers": {
    "material3": {
      "command": "npx",
      "args": ["-y", "@weppa-cloud/material3-mcp-server"],
      "env": {
        "GITHUB_TOKEN": "ghp_YOUR_TOKEN_HERE",
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

**Step 3: Restart your AI host**

---

### Log Level Configuration

Control logging verbosity:

```json
{
  "env": {
    "LOG_LEVEL": "DEBUG"  // DEBUG, INFO, WARN, ERROR
  }
}
```

**Log levels:**
- `DEBUG`: Detailed information for debugging
- `INFO`: General informational messages (default)
- `WARN`: Warning messages
- `ERROR`: Error messages only

**Viewing logs:**

- **Claude Desktop:** Check stderr output in application logs
- **Cursor:** Check Output panel → MCP
- **Command line:** Logs appear in terminal when running manually

---

## Troubleshooting Quick Fixes

### Issue: "Server not detected"

**Solution:**
1. Check JSON syntax in configuration file (use a JSON validator)
2. Ensure file path is correct
3. Restart AI host completely
4. Check logs for error messages

**See:** [Troubleshooting Guide](./troubleshooting.md#server-not-detected)

---

### Issue: "Rate limit exceeded"

**Solution:**
Set `GITHUB_TOKEN` environment variable (see [Optional Configuration](#github-token-recommended))

**See:** [Troubleshooting Guide](./troubleshooting.md#rate-limits)

---

### Issue: "Network connection failed"

**Solution:**
1. Check internet connection
2. Verify you can access github.com and m3.material.io
3. Check firewall/proxy settings

**See:** [Troubleshooting Guide](./troubleshooting.md#network-errors)

---

### Issue: "Invalid input parameters"

**Solution:**
Check the API reference for correct parameter types and values.

**See:** [API Reference](./api-reference.md)

---

## Next Steps

Now that you're set up, explore more features:

### Learn by Example
- [Claude Desktop Usage Examples](../examples/claude-desktop-usage.md)
- [Cursor Integration Examples](../examples/cursor-integration.md)
- [Common Queries](../examples/common-queries.md)

### Deep Dive
- [API Reference](./api-reference.md) - Complete tool documentation
- [Examples](./examples.md) - Real-world workflows
- [Troubleshooting](./troubleshooting.md) - Detailed problem solving

### Optimize
- Set up GitHub token for higher rate limits
- Explore all 5 MCP tools
- Try multi-tool workflows

### Connect
- [GitHub Repository](https://github.com/weppa-cloud/material3-mcp-server)
- [Report Issues](https://github.com/weppa-cloud/material3-mcp-server/issues)
- [NPM Package](https://www.npmjs.com/package/@weppa-cloud/material3-mcp-server)

---

## Support

If you encounter issues not covered here:

1. **Check the** [Troubleshooting Guide](./troubleshooting.md)
2. **Search existing** [GitHub Issues](https://github.com/weppa-cloud/material3-mcp-server/issues)
3. **Open a new issue** with:
   - Your OS and Node.js version
   - AI host (Claude Desktop, Cursor, etc.)
   - Configuration file (remove sensitive tokens)
   - Error messages
   - Steps to reproduce

---

**Congratulations!** You're now ready to build Material 3 UIs with AI assistance.

Happy coding! 🎨