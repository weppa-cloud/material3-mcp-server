# Specify Command for Material 3 MCP Server

## Purpose
Define WHAT you want to build and WHY - functional requirements for MCP tools/resources/prompts before any technical implementation. This is the first step in the Material 3 MCP feature development workflow.

## Usage
When the user requests: "/specify [feature description]" or "Specify requirements for [feature]"

## Arguments
`$ARGUMENTS` - Feature description or reference to existing issue/document

## Process

### 1. Initial Understanding
- Parse the feature request
- Identify core value for Material 3 ecosystem
- Determine MCP primitive type (tool, resource, or prompt)
- Consider framework compatibility needs (Web, Flutter, React, Angular)
- Check for related GitHub issues

### 2. Research Context
```bash
# Check existing similar MCP tools
find src/tools -name "*.ts" | xargs grep -l "similar_pattern"

# Review current MCP server capabilities
cat CLAUDE.md | grep -i "related_feature"

# Check src/index.ts for registered tools
cat src/index.ts

# Check GitHub issues for related discussions
gh issue list --search "keywords"
```

### 3. Functional Specification Structure

Create a specification following this template:

```markdown
# Feature Specification: [MCP Feature Name]

## Executive Summary
[2-3 sentences describing WHAT this MCP feature does and WHY it's needed for the Material 3 ecosystem]

## Ecosystem Value
- **Problem Statement**: [Current pain point for Material 3 developers]
- **Solution Impact**: [How this helps Material 3 development workflows]
- **Affected Users**: [Developers using Claude Desktop, Cursor, VS Code with MCP]
- **Priority**: [P1/P2/P3 based on Material 3 ecosystem needs]

## User Stories

### Story 1: [Developer] + [Action] + [Outcome]
**As a** [Material 3 developer using Claude/Cursor]
**I want to** [action/capability through MCP]
**So that** [business value/outcome in development workflow]

**Acceptance Criteria:**
- [ ] MCP tool/resource can be invoked from Claude
- [ ] Input parameters are validated with clear error messages
- [ ] Output format is structured and consumable
- [ ] Returns data in expected format (text, JSON, code, etc.)

**Technical Constraints:**
- MCP primitive type: [tool/resource/prompt]
- Input schema: [Brief description of expected inputs]
- Output format: [Brief description of return format]

### Story 2: [Continue pattern...]

## Functional Requirements

### Core MCP Capability
1. **[MCP Primitive Name]**
   - What it does: [Description of Material 3 capability]
   - Input: [Parameters the MCP tool/resource accepts]
   - Output: [Data structure returned]
   - Constraints: [Rate limits, size limits, validation rules]

2. **[Additional Capability]**
   - [Continue pattern...]

### Data Source Requirements
- **Primary Data Source**: [GitHub API, web scraping, static data, etc.]
- **Fallback Sources**: [Alternative data sources if primary fails]
- **Caching Strategy**: [Whether to cache, TTL duration]
- **Authentication Needs**: [API tokens, OAuth, public access]

### Input Schema Requirements
- **Required Parameters**: [List of mandatory inputs]
- **Optional Parameters**: [List of optional inputs with defaults]
- **Validation Rules**: [Format, length, enum constraints]
- **Example Invocations**: [Sample MCP tool calls]

### Output Format Requirements
- **Success Response**: [Structure of successful output]
- **Error Response**: [Error message format and codes]
- **Content Type**: [text, JSON, code, image data]
- **Size Constraints**: [Maximum output size]

### Framework Compatibility
- **Web Components**: [Support level and requirements]
- **Flutter**: [Support level and requirements]
- **React**: [Support level and requirements]
- **Angular**: [Support level and requirements]

### Material 3 Integration Points
1. **Design System Data**: [Which Material 3 specs are accessed]
2. **Component Sources**: [Official repos, documentation, APIs]
3. **Token Systems**: [Color, typography, spacing tokens]
4. **Documentation**: [Links to Material 3 official docs]

## Success Metrics
- [ ] MCP tool responds within acceptable latency (< 2s typical)
- [ ] Output format is correct and complete
- [ ] Integration works in Claude Desktop, Cursor, VS Code
- [ ] Handles error cases gracefully with clear messages

## Out of Scope
- [Features not included in this MCP tool version]
- [Future enhancements planned for later versions]

## Open Questions
- [ ] [Technical question needing clarification]
- [ ] [Decision pending on data source or format]

## Dependencies
- **NPM Packages**: [Required dependencies]
- **External APIs**: [Third-party services needed]
- **Material 3 Resources**: [Specific M3 documentation or repos]

## Examples/References
- [Link to similar MCP tools]
- [Reference Material 3 documentation]
- [Example output from similar tools]
```

### 4. Validation Questions
Before finalizing, verify:
- Is the WHAT clearly defined without HOW?
- Are success criteria measurable?
- Have all user roles been considered?
- Are business rules explicit?
- Is the scope clearly bounded?

### 5. Output
Save specification as: `.specify/specs/[feature-number]-[feature-name].md`

Example: `.specify/specs/001-bulk-contact-import.md`

### 6. Quality Checklist
Rate the specification (1-10) based on:
- [ ] Clarity of requirements
- [ ] Completeness of user stories
- [ ] Measurable acceptance criteria
- [ ] Well-defined scope
- [ ] Business value articulation

## Examples

### Good Specification Request:
"Build an MCP tool that generates a complete Material 3 theme from a seed color. It should accept a hex color as input and return design tokens for primary, secondary, and tertiary color palettes in both light and dark modes. Output should be available in CSS custom properties, JSON, and SCSS variable formats."

### Output Focus:
- WHAT: MCP tool for Material 3 theme generation from seed color
- WHY: Accelerate Material 3 design system setup and prototyping
- WHO: Developers using Claude Desktop, Cursor, VS Code with MCP
- SUCCESS: Complete theme tokens generated in < 1s with correct Material 3 color algorithm

## Anti-patterns to Avoid
❌ Jumping to provider implementation details
❌ Specifying exact Zod schemas (that's for /generate-prp)
❌ Defining specific GitHub API endpoints
❌ Choosing specific npm packages
❌ Writing TypeScript code examples

## Next Steps
After specification is complete:
1. Run `/clarify` to refine any ambiguous points
2. Get stakeholder approval on requirements
3. Run `/generate-prp` to create technical blueprint
4. Execute implementation

---
Remember: Focus on WHAT and WHY, not HOW. Be explicit about user needs and business value.