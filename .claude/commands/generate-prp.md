# Generate PRP (Product Requirements Prompt) for Material 3 MCP Server

## Feature file: $ARGUMENTS

Generate a complete PRP for MCP tool/resource/prompt implementation based on functional requirements and Material 3 MCP Server architecture.

## Pre-requisites Check
Before generating PRP, verify:
- [ ] `/specify` has been run (check `.specify/specs/` for MCP tool requirements)
- [ ] `/clarify` has been run if needed (check `.specify/clarifications/` for refined requirements)
- [ ] All ambiguities about Material 3 specs and MCP design are resolved
- [ ] Framework compatibility requirements are clear

If specifications don't exist, inform user to run:
1. `/specify [feature]` first to define WHAT MCP capability to build
2. `/clarify` if requirements need refinement (especially for Material 3 specs)
3. Then return to `/generate-prp`

## Context for AI Agent
The AI agent only gets the context you are appending to the PRP and training data. Assume the AI agent has access to the codebase and the same knowledge cutoff as you, so its important that your research findings are included or referenced in the PRP. The Agent has WebSearch capabilities, so pass urls to documentation and examples.

## Research Process

1. **MCP Codebase Analysis**
   - Review existing MCP tools in `src/tools/` for patterns
   - Check provider implementations in `src/providers/`
   - Review `src/index.ts` for tool registration patterns
   - Examine `src/utils/logger.ts` for logging conventions
   - Note Zod schema patterns from existing tools
   - Check error handling approaches

2. **Material 3 Specification Research**
   - Official Material 3 documentation at m3.material.io
   - GitHub repositories (material-components/material-web, etc.)
   - Material Design GitHub discussions and issues
   - Framework-specific Material 3 implementations
   - Design token specifications and formats
   - Component anatomy and API documentation

3. **MCP Protocol Research**
   - MCP Documentation: https://modelcontextprotocol.io/
   - MCP TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
   - MCP Inspector usage for testing
   - Similar MCP servers (shadcn-ui-mcp, material-ui-mcp, nuxt-ui-mcp)
   - Best practices for MCP tool design

4. **External Implementation Examples**
   - Search for similar Material 3 tools online
   - Check npm packages for Material 3 utilities
   - Review CodePen/Glitch examples
   - GitHub repositories with Material 3 implementations
   - Best practices and common pitfalls

5. **User Clarification** (if needed)
   - Specific Material 3 patterns to follow?
   - Which Material 3 frameworks to prioritize?
   - Data source preferences (GitHub API vs web scraping)?
   - Output format preferences?

## PRP Generation

Using PRPs/templates/prp_base.md as template:

### Critical Context to Include for MCP Implementation

#### Material 3 Context
- **Material 3 Documentation URLs**: Specific m3.material.io pages with exact sections
- **GitHub Repository URLs**: Links to material-components repos with file paths
- **Component Specifications**: Official Material 3 component anatomy and APIs
- **Design Token Formats**: Color, typography, spacing, elevation token structures
- **Framework Examples**: Links to official framework implementations

#### MCP Server Context
- **Tool Registration Pattern**: Reference src/index.ts registration approach
- **Zod Schema Examples**: Reference existing tools for schema patterns
- **Provider Patterns**: Reference MaterialWebProvider or DocumentationProvider
- **Logger Usage**: stderr logging pattern from src/utils/logger.ts
- **Error Handling**: Error response format from existing tools

#### Implementation Context
- **Code Examples**: Real TypeScript snippets from existing MCP tools
- **GitHub API Patterns**: Rate limiting, authentication, fallback strategies
- **Caching Strategies**: If applicable, reference caching approaches
- **Testing Approach**: MCP Inspector usage, unit test patterns
- **Integration Examples**: Claude Desktop/Cursor configuration snippets

### Implementation Blueprint
- **MCP Tool Registration**: How to register in src/index.ts with McpServer
- **Input Schema**: Complete Zod schema definition with validation
- **Provider Implementation**: New provider or extension of existing
- **Tool Handler Logic**: Step-by-step processing flow with pseudocode
- **Output Serialization**: Format data for MCP response
- **Error Handling**: All error scenarios with appropriate responses
- **Logging Strategy**: What to log and when (using stderr)
- **Testing Plan**: MCP Inspector tests and unit tests
- **Tasks List**: Ordered implementation steps to complete the feature

*** CRITICAL AFTER YOU ARE DONE RESEARCHING AND EXPLORING THE CODEBASE BEFORE YOU START WRITING THE PRP ***

*** ULTRATHINK ABOUT THE PRP AND PLAN YOUR APPROACH THEN START WRITING THE PRP ***

## Output
Save as: `PRPs/{feature-name}.md`

## Quality Checklist for MCP PRPs
- [ ] All Material 3 documentation URLs included with specific sections
- [ ] MCP protocol requirements clearly specified
- [ ] Zod input schema fully defined with examples
- [ ] Output format clearly documented with structure
- [ ] Provider implementation strategy defined (new vs extend existing)
- [ ] Tool registration approach specified for src/index.ts
- [ ] Error handling covers all edge cases
- [ ] Logging strategy uses stderr (stdout reserved for JSON-RPC)
- [ ] Testing plan includes MCP Inspector and unit tests
- [ ] Framework compatibility requirements addressed
- [ ] GitHub API strategy defined (if applicable)
- [ ] Caching strategy specified (if applicable)
- [ ] Integration examples for Claude Desktop/Cursor included
- [ ] References existing MCP tool patterns in codebase
- [ ] Clear task list in implementation order

Score the PRP on a scale of 1-10 (confidence level to succeed in one-pass implementation using Claude Code)

**Target Score: 9-10** for MCP tool implementation success

Remember: The goal is one-pass implementation success through comprehensive Material 3 and MCP context, with all necessary documentation URLs, code patterns, and technical specifications.