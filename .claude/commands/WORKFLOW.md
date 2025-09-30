# Material 3 MCP Server Feature Development Workflow

## 🎯 The Complete Workflow

A systematic approach to MCP server feature development that ensures clarity, quality, and consistency for Material 3 integration.

```mermaid
graph TD
    A[Feature Request] --> B[/specify]
    B --> C[Functional Spec Created]
    C --> D{Need Clarification?}
    D -->|Yes| E[/clarify]
    E --> F[Questions Answered]
    F --> D
    D -->|No| G[/generate-prp]
    G --> H[Technical Blueprint]
    H --> I[/execute-prp]
    I --> J[Feature Implemented]
    J --> K[Tests & Validation]
    K --> L[PR & Review]
```

## 📝 Phase 1: Specification (`/specify`)

**Purpose**: Define WHAT to build and WHY - no technical details

### When to Use
- Starting any new feature
- When requirements are unclear
- Converting user feedback into actionable specs

### Command
```bash
/specify "Add MCP tool to generate Material 3 theme from base colors"
```

### Output
- **Location**: `.specify/specs/001-material-theme-generator.md`
- **Contains**: User stories, acceptance criteria, MCP tool specifications
- **Focus**: Functional requirements without implementation details

### Example Output Structure
```markdown
# Feature Specification: Material 3 Theme Generator Tool

## User Stories
As a developer using Claude, I want to generate a complete Material 3 theme from base colors, so that I can quickly prototype design systems

## Acceptance Criteria
- [ ] MCP tool accepts seed color as input
- [ ] System generates complete color palette (primary, secondary, tertiary)
- [ ] Output includes light and dark mode tokens
- [ ] Returns tokens in multiple formats (CSS, JSON, SCSS)
```

## 🔍 Phase 2: Clarification (`/clarify`)

**Purpose**: Resolve ambiguities and edge cases before implementation

### When to Use
- After `/specify` if requirements are ambiguous
- When edge cases aren't covered
- Need specific business rule clarifications

### Command
```bash
/clarify ".specify/specs/001-material-theme-generator.md"
```

### Output
- **Location**: `.specify/clarifications/001-material-theme-generator-clarified.md`
- **Contains**: Questions, decisions, refined requirements
- **Focus**: Eliminating ambiguity

### Example Clarifications
```markdown
❓ Which Material 3 color algorithms should be used?
   Decision: Use @material/material-color-utilities package

❓ What output formats are required?
   Decision: Support CSS custom properties, JSON, SCSS variables, and TypeScript

❓ Should this integrate with Figma tokens?
   Decision: V1 focuses on programmatic generation, Figma integration in V2
```

## 🏗️ Phase 3: Technical Blueprint (`/generate-prp`)

**Purpose**: Create detailed technical implementation plan

### When to Use
- After specifications are clear and complete
- Requirements have been clarified
- Ready to move to implementation

### Command
```bash
/generate-prp ".specify/specs/001-material-theme-generator.md"
```

### Output
- **Location**: `PRPs/material-theme-generator-20250929.md`
- **Contains**: Technical approach, MCP patterns, validation gates
- **Focus**: HOW to implement the WHAT

### Blueprint Includes
- MCP tool registration with McpServer
- Zod input schema definition
- Provider implementation for color generation
- Output format and serialization
- Error handling and logging strategy
- Testing with MCP Inspector
- Integration examples for Claude Desktop/Cursor

## 🚀 Phase 4: Implementation (`/execute-prp`)

**Purpose**: Execute the technical blueprint

### Command
```bash
/execute-prp "PRPs/material-theme-generator-20250929.md"
```

### Process
1. Create feature branch
2. Implement MCP tool in src/tools/
3. Create or update providers in src/providers/
4. Register tool in src/index.ts
5. Write unit tests
6. Test with MCP Inspector
7. Update documentation

## 📊 Decision Tree

### Which Command to Use?

```
Is the feature clearly defined?
├── No → /specify
├── Yes → Are there ambiguities?
    ├── Yes → /clarify
    ├── No → Do you have a technical plan?
        ├── No → /generate-prp
        └── Yes → /execute-prp
```

## 🎯 Best Practices

### For `/specify`
✅ Focus on Material 3 developer needs and ecosystem value
✅ Write measurable acceptance criteria for MCP tools
✅ Consider all framework integrations (Web/Flutter/React/Angular)
❌ Don't include technical implementation details
❌ Don't specify provider implementations or APIs

### For `/clarify`
✅ Ask specific questions about Material 3 specifications
✅ Clarify framework compatibility requirements
✅ Document decisions on data sources and formats
❌ Don't introduce new requirements
❌ Don't assume technical solutions

### For `/generate-prp`
✅ Reference existing MCP patterns in src/tools/ and src/providers/
✅ Include MCP Inspector testing strategy
✅ Provide complete context with Material 3 documentation URLs
✅ Consider caching and performance optimization
❌ Don't skip research phase on Material 3 specs
❌ Don't ignore MCP protocol requirements

### For `/execute-prp`
✅ Follow MCP protocol specifications exactly
✅ Use stderr for logging (stdout reserved for JSON-RPC)
✅ Test with MCP Inspector before final PR
✅ Validate Zod schemas and error handling
❌ Don't add out-of-scope features
❌ Don't skip unit tests or integration examples

## 📁 Directory Structure

```
material3-mcp-server/
├── .specify/
│   ├── specs/                    # Functional specifications
│   │   ├── 001-theme-generator.md
│   │   └── 002-figma-integration.md
│   └── clarifications/           # Refined requirements
│       ├── 001-theme-generator-clarified.md
│       └── 002-figma-integration-clarified.md
├── PRPs/
│   ├── templates/               # Reusable PRP templates
│   ├── in-progress/            # Active implementations
│   └── completed/              # Finished features
├── src/
│   ├── index.ts                # MCP server entry point
│   ├── tools/                  # MCP tool implementations
│   ├── providers/              # Data providers
│   └── utils/                  # Logger, validators
└── .claude/
    ├── commands/               # Workflow commands
    │   ├── specify.md
    │   ├── clarify.md
    │   ├── generate-prp.md
    │   └── execute-prp.md
    └── agents/
        └── prp-generator.md    # PRP generation agent
```

## 🔄 Iteration Patterns

### Minor Feature (< 2 hours)
```
/specify → /generate-prp → /execute-prp
```

### Standard Feature (2-8 hours)
```
/specify → /clarify → /generate-prp → /execute-prp
```

### Complex Feature (> 8 hours)
```
/specify → /clarify (iterate) → /generate-prp → /execute-prp
```

## 🎓 Examples

### Example 1: Simple MCP Tool
```bash
# User request: "Add tool to search Material Icons by keyword"
/specify "Add MCP tool to search Material Symbols icon library"
# Clear requirements, skip clarify
/generate-prp ".specify/specs/003-icon-search.md"
/execute-prp "PRPs/icon-search-20250929.md"
```

### Example 2: Complex Integration Feature
```bash
# User request: "Figma plugin integration for exporting Material 3 components"
/specify "MCP tool to convert Figma designs to Material 3 component code"
/clarify ".specify/specs/004-figma-to-code.md"
# Answer: Use Figma REST API, support Web Components first, cache 1 hour
/generate-prp ".specify/specs/004-figma-to-code.md"
/execute-prp "PRPs/figma-to-code-20250929.md"
```

## 📈 Success Metrics

### Specification Quality
- User stories cover all roles
- Acceptance criteria are measurable
- Business value is clear
- Score: 8+ / 10

### Clarification Completeness
- All ambiguities resolved
- Edge cases documented
- Decisions recorded
- Score: 9+ / 10

### PRP Effectiveness
- One-pass implementation success
- No major revisions needed
- Tests pass first try
- Score: 9+ / 10

## 🚨 Common Pitfalls

### Skipping Phases
❌ Going straight to PRP without specs
✅ Always start with /specify for new features

### Mixing Concerns
❌ Technical details in /specify
✅ Keep functional and technical separate

### Incomplete Clarification
❌ Assuming edge case behavior
✅ Always clarify ambiguities

### Scope Creep
❌ Adding features during implementation
✅ Stick to the specification

## 🔗 Integration with GitHub

### Workflow with Issues
```bash
# 1. Create issue
gh issue create --title "Add Material 3 theme generator tool"

# 2. Specify from issue
/specify "#45"  # References GitHub issue

# 3. Link PRP to issue
# PRP will include: "GitHub Issue: #45"

# 4. PR references issue
# Commit: "feat: add theme generator MCP tool (closes #45)"
```

## 💡 Tips for Success

1. **Start with Why**: Always clarify business value first
2. **Small Steps**: Break large features into smaller specs
3. **Get Feedback Early**: Run /clarify with stakeholders
4. **Document Decisions**: Record why choices were made
5. **Test Assumptions**: Verify with existing code patterns
6. **Iterate Quickly**: Better to clarify than assume

---

**Remember**: The workflow ensures we build the RIGHT thing (specify/clarify) the RIGHT way (generate-prp/execute-prp)