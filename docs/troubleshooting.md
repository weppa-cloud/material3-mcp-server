# Troubleshooting Guide

This guide covers common issues and their solutions when using the Material 3 MCP Server.

---

## Table of Contents

1. [Common Issues](#common-issues)
2. [Runtime Errors](#runtime-errors)
3. [Debugging Techniques](#debugging-techniques)
4. [Integration-Specific Issues](#integration-specific-issues)
5. [Performance Issues](#performance-issues)
6. [Getting Help](#getting-help)

---

## Common Issues

### Server Not Detected by AI Host

**Symptoms:**
- AI host doesn't show Material 3 MCP server in server list
- Commands don't trigger Material 3 tools
- No response when asking about Material 3 components

**Common Causes:**

1. **Invalid JSON syntax in configuration file**
2. **Incorrect file path**
3. **Server not restarted after configuration**
4. **Permission issues**

**Solutions:**

#### Solution 1: Validate JSON Syntax

Use a JSON validator to check your configuration file:

```bash
# macOS/Linux
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .

# Windows (PowerShell)
Get-Content $env:APPDATA\Claude\claude_desktop_config.json | ConvertFrom-Json
```

**Common JSON errors:**
- Missing commas between entries
- Trailing commas (not allowed in JSON)
- Unescaped quotes in strings
- Missing closing braces

**Correct format:**
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

#### Solution 2: Verify File Path

Check that your configuration file exists:

```bash
# macOS
ls -la ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Linux
ls -la ~/.config/Claude/claude_desktop_config.json

# Windows (PowerShell)
Test-Path $env:APPDATA\Claude\claude_desktop_config.json
```

If file doesn't exist, create it with the correct configuration.

#### Solution 3: Restart AI Host Completely

**Claude Desktop:**
- macOS: Press ⌘+Q to quit completely, then reopen
- Windows: Right-click system tray icon → Exit, then reopen
- Verify it restarted: Check "About" menu for current session

**Cursor:**
- Press Cmd/Ctrl+Shift+P → "Reload Window"
- Or restart Cursor completely

#### Solution 4: Check Permissions

Ensure the configuration file has correct permissions:

```bash
# macOS/Linux
chmod 644 ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Verify
ls -l ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Expected permissions:** `-rw-r--r--` (644)

---

### Configuration JSON Syntax Errors

**Symptoms:**
- Server doesn't load
- AI host shows configuration error
- Error messages about JSON parsing

**Solution:**

Copy this validated configuration template:

```json
{
  "mcpServers": {
    "material3": {
      "command": "npx",
      "args": ["-y", "@weppa-cloud/material3-mcp-server"],
      "env": {
        "GITHUB_TOKEN": "",
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

**If you have multiple MCP servers:**

```json
{
  "mcpServers": {
    "server1": {
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

**Important:**
- No trailing comma after last server entry
- Consistent indentation
- Proper string escaping

---

### Permission Denied Errors

**Symptoms:**
```
Error: EACCES: permission denied
```

**Solutions:**

#### Solution 1: Fix npm permissions

```bash
# macOS/Linux - fix npm global directory permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Verify
npm config get prefix
```

#### Solution 2: Use npx instead of global install

Instead of `npm install -g`, use `npx` in configuration:

```json
{
  "command": "npx",
  "args": ["-y", "@weppa-cloud/material3-mcp-server"]
}
```

This avoids permission issues entirely.

---

## Runtime Errors

### GitHub API Rate Limits

**Error Message:**
```
❌ GitHub API rate limit exceeded

💡 Suggested solution:
Set GITHUB_TOKEN environment variable for higher rate limits (5,000/hour).

📚 More information:
https://github.com/weppa-cloud/material3-mcp-server/blob/main/docs/troubleshooting.md#rate-limits
```

**Cause:**

GitHub API has rate limits:
- **Without token:** 60 requests/hour
- **With token:** 5,000 requests/hour

**Solution:**

#### Step 1: Create GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. **Name:** `material3-mcp-server`
4. **Expiration:** 90 days (or "No expiration")
5. **Scopes:**
   - ✅ `public_repo` (for public repositories)
   - Or leave all unchecked (read-only access to public data)
6. Click "Generate token"
7. **Copy the token** (starts with `ghp_`)

#### Step 2: Add Token to Configuration

Update your configuration file:

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

#### Step 3: Restart AI Host

Quit and reopen your AI host for changes to take effect.

#### Step 4: Verify

Ask your AI:
```
List Material 3 components
```

Check logs for confirmation:
```
[INFO] GitHub API rate limit: 4999/5000 remaining
```

**Security Notes:**
- Never commit your token to version control
- Tokens have read-only access (safe for this use case)
- Regenerate if token is compromised
- Use short expiration for better security

---

### Authentication Failures

**Error Message:**
```
❌ Access denied by GitHub API

💡 Suggested solution:
Verify your GITHUB_TOKEN is valid and has the correct permissions.
```

**Causes:**
1. Token expired
2. Token deleted or revoked
3. Insufficient permissions
4. Malformed token

**Solutions:**

#### Check Token Validity

Test your token:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" https://api.github.com/user
```

**Expected:** JSON response with user information
**If invalid:** `401 Unauthorized` or `403 Forbidden`

#### Generate New Token

If token is invalid:
1. Go to https://github.com/settings/tokens
2. Delete old token
3. Generate new token (see [Rate Limits](#github-api-rate-limits))
4. Update configuration
5. Restart AI host

---

### Network Connection Errors

**Error Message:**
```
❌ Network connection failed

💡 Suggested solution:
Check your internet connection and firewall settings.
```

**Symptoms:**
- `ECONNREFUSED` errors
- `ETIMEDOUT` errors
- Cannot fetch component data

**Solutions:**

#### Solution 1: Check Internet Connection

Test connectivity:

```bash
# Test GitHub
ping github.com

# Test Material 3 docs site
ping m3.material.io

# Test GitHub API
curl https://api.github.com

# Test Material Web repo
curl https://github.com/material-components/material-web
```

#### Solution 2: Check Firewall/Proxy

If behind corporate firewall:

1. **Configure npm proxy:**
```bash
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

2. **Set environment variables:**
```json
{
  "env": {
    "HTTP_PROXY": "http://proxy.company.com:8080",
    "HTTPS_PROXY": "http://proxy.company.com:8080",
    "NO_PROXY": "localhost,127.0.0.1"
  }
}
```

#### Solution 3: Check DNS

Test DNS resolution:

```bash
nslookup github.com
nslookup m3.material.io
```

If DNS fails, try alternative DNS servers (e.g., 8.8.8.8, 1.1.1.1).

#### Solution 4: Retry with Timeout

The server automatically retries failed requests. If persistent:

1. Wait a few minutes
2. Check https://www.githubstatus.com/ for GitHub outages
3. Check https://downdetector.com/ for Material 3 site issues

---

### Component Not Found

**Error Message:**
```
❌ Resource not found

💡 Suggested solution:
The requested component "xyz" may not exist. Use list_material_components to see available components.
```

**Cause:**
Component name is incorrect or doesn't exist in Material 3.

**Solution:**

#### Step 1: List Available Components

Ask your AI:
```
List all Material 3 components
```

#### Step 2: Check Component Name

Material 3 component names are lowercase with hyphens:
- ✅ `button` (correct)
- ❌ `Button` (incorrect)
- ✅ `text-field` (correct)
- ❌ `textField` (incorrect)

#### Step 3: Check Framework Support

Not all components are available in all frameworks:

```
List Material 3 components for Flutter
```

#### Step 4: Check Component Category

Components are organized by category:
- Actions: button, fab, icon-button, segmented-button
- Communication: badge, progress-indicator, snackbar
- Containment: card, divider, list, carousel
- Navigation: navigation-bar, navigation-drawer, tabs, search
- Selection: checkbox, chip, radio, slider, switch
- Text Input: text-field, autocomplete

---

### Validation Errors

**Error Message:**
```
❌ Invalid input parameters

💡 Suggested solution:
Validation errors: category: Invalid enum value. Expected 'buttons' | 'cards', received 'invalid'
```

**Cause:**
Input parameters don't match expected schema.

**Solution:**

Check the [API Reference](./api-reference.md) for correct parameter types and values.

**Common validation errors:**

1. **Invalid enum value**
   ```
   ❌ { category: 'button' }  // Wrong
   ✅ { category: 'buttons' } // Correct
   ```

2. **Wrong type**
   ```
   ❌ { limit: "20" }  // String, wrong
   ✅ { limit: 20 }    // Number, correct
   ```

3. **Missing required parameter**
   ```
   ❌ get_component_code({})  // Missing componentName
   ✅ get_component_code({ componentName: 'button' })
   ```

---

## Debugging Techniques

### Enable Debug Logging

Set `LOG_LEVEL` to `DEBUG` for detailed information:

```json
{
  "env": {
    "LOG_LEVEL": "DEBUG"
  }
}
```

**Log levels:**
- `DEBUG`: Detailed debugging information
- `INFO`: General informational messages (default)
- `WARN`: Warning messages
- `ERROR`: Error messages only

### View Server Logs

**Claude Desktop (macOS):**
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

**Claude Desktop (Linux):**
```bash
tail -f ~/.local/state/claude/logs/mcp*.log
```

**Cursor:**
- Open Output panel (View → Output)
- Select "MCP" from dropdown

**Manual execution (for debugging):**
```bash
npx @weppa-cloud/material3-mcp-server
```

### Use MCP Inspector

The MCP Inspector provides a web UI for testing tools:

```bash
cd material3-mcp-server
npm run inspector
```

Open http://localhost:6274 in your browser.

**Features:**
- Test each tool individually
- Inspect input/output schemas
- View error responses
- Monitor performance

### Check Server Status

Verify server is running:

```bash
# Check if process is running
ps aux | grep material3-mcp-server

# Check listening ports (if server uses network)
lsof -i -P | grep material3
```

---

## Integration-Specific Issues

### Claude Desktop Issues

#### Issue: Server loads but tools don't work

**Solution:**
1. Check Claude Desktop version (should be latest)
2. Try asking explicitly: "Use the Material 3 MCP server to list components"
3. Check that Material 3 server appears in MCP servers list

#### Issue: Slow responses

**Solution:**
1. Set `GITHUB_TOKEN` to avoid rate limits
2. Check internet connection speed
3. Try simpler queries first

---

### Cursor IDE Issues

#### Issue: MCP tools not appearing in autocomplete

**Solution:**
1. Reload window: Cmd/Ctrl+Shift+P → "Reload Window"
2. Check `~/.cursor/config/mcp.json` exists and is valid
3. Open Cursor AI Chat and type explicitly

#### Issue: "MCP server not responding"

**Solution:**
1. Check Output panel for errors
2. Verify Node.js version (≥18.0.0)
3. Try global installation: `npm install -g @weppa-cloud/material3-mcp-server`

---

### VS Code with Continue

#### Issue: Continue doesn't detect MCP server

**Solution:**
1. Verify Continue extension is installed and updated
2. Check Continue settings have MCP servers section
3. Reload VS Code window

---

## Performance Issues

### Slow Response Times

**Symptoms:**
- Requests take > 5 seconds
- Timeouts occur frequently

**Solutions:**

1. **Set GitHub Token**
   - Improves rate limits
   - See [Rate Limits](#github-api-rate-limits)

2. **Check Network Speed**
   ```bash
   curl -o /dev/null -s -w '%{time_total}\n' https://api.github.com
   ```
   Should be < 1 second

3. **Clear Cache** (if implementing caching)
   ```bash
   rm -rf ~/.cache/material3-mcp-server
   ```

4. **Update to Latest Version**
   ```bash
   npm update -g @weppa-cloud/material3-mcp-server
   ```

---

### High Memory Usage

**Symptoms:**
- Server uses excessive RAM
- System slowdown

**Solutions:**

1. **Check for Memory Leaks**
   ```bash
   node --inspect npx @weppa-cloud/material3-mcp-server
   ```
   Use Chrome DevTools to profile memory

2. **Restart Server**
   - Quit AI host completely
   - Reopen to start fresh server instance

3. **Report Issue**
   - If persistent, report on GitHub with:
     - Memory usage stats
     - Queries causing high usage
     - System specifications

---

## Getting Help

If your issue isn't covered here:

### 1. Search Existing Issues

Check if someone else encountered the same problem:
https://github.com/weppa-cloud/material3-mcp-server/issues

### 2. Review Documentation

- [Getting Started Guide](./getting-started.md)
- [API Reference](./api-reference.md)
- [Examples](./examples.md)

### 3. Open a New Issue

Create a detailed issue report:
https://github.com/weppa-cloud/material3-mcp-server/issues/new

**Include:**

```markdown
## Environment
- OS: macOS 14.0 / Windows 11 / Ubuntu 22.04
- Node.js version: 20.10.0
- AI Host: Claude Desktop 1.0.0 / Cursor 0.35.0
- Package version: 1.2.0

## Configuration
```json
{
  "mcpServers": {
    "material3": {
      "command": "npx",
      "args": ["-y", "@weppa-cloud/material3-mcp-server"],
      "env": {
        "LOG_LEVEL": "DEBUG"
      }
    }
  }
}
```

## Steps to Reproduce
1. Open Claude Desktop
2. Ask: "List Material 3 button components"
3. Error occurs

## Expected Behavior
Should list button components

## Actual Behavior
Error: [paste error message]

## Logs
[paste relevant logs with LOG_LEVEL=DEBUG]

## Additional Context
[any other relevant information]
```

### 4. Community Resources

- **NPM Package:** https://www.npmjs.com/package/@weppa-cloud/material3-mcp-server
- **GitHub Repo:** https://github.com/weppa-cloud/material3-mcp-server
- **Material 3 Docs:** https://m3.material.io/

---

## Quick Reference

### Common Commands

```bash
# Test installation
npx @weppa-cloud/material3-mcp-server --version

# Run package validation
./scripts/test-package.sh

# View logs (macOS)
tail -f ~/Library/Logs/Claude/mcp*.log

# Check JSON syntax
cat config.json | jq .

# Update package
npm update -g @weppa-cloud/material3-mcp-server

# Run with debug logging
LOG_LEVEL=DEBUG npx @weppa-cloud/material3-mcp-server
```

### Common Fixes

1. **Server not detected** → Check JSON syntax, restart AI host
2. **Rate limit exceeded** → Set GITHUB_TOKEN
3. **Network error** → Check internet connection, firewall
4. **Component not found** → Check component name spelling
5. **Validation error** → Check API reference for correct parameters

---

**Still stuck?** [Open an issue](https://github.com/weppa-cloud/material3-mcp-server/issues) with detailed information.