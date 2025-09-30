# Clarify Command for Material 3 MCP Server

## Purpose
Refine and clarify functional requirements from `/specify` by asking targeted questions about Material 3 specifications, MCP tool design, and framework compatibility. Resolve ambiguities and ensure all edge cases are covered before technical implementation.

## Usage
When the user requests: "/clarify [specification-file]" or "Clarify requirements for [feature]"

## Arguments
`$ARGUMENTS` - Path to specification file or feature name

## Process

### 1. Load Specification
```bash
# Load the MCP feature specification to clarify
cat .specify/specs/[feature-number]-[feature-name].md

# Or load from other source
cat $ARGUMENTS

# Also review existing MCP tools for context
cat src/index.ts
ls src/tools/
```

### 2. Analysis Framework

#### A. Requirements Analysis
Review each requirement and identify:
- **Ambiguous Terms**: Words like "fast", "user-friendly", "intuitive"
- **Missing Details**: Unspecified limits, thresholds, or boundaries
- **Implicit Assumptions**: Things assumed but not stated
- **Edge Cases**: Boundary conditions not addressed

#### B. User Story Validation
For each user story, verify:
- **Actor Clarity**: Is the user role specific enough?
- **Action Precision**: Is the action measurable?
- **Outcome Verification**: Can success be objectively measured?

### 3. Clarification Questions Template

Generate targeted questions based on gaps found:

```markdown
# Clarification Questions: [MCP Feature Name]

## MCP Tool/Resource/Prompt Clarifications

### [Requirement/Story Name]

**Current Understanding:**
[What the specification currently says about the MCP primitive]

**Clarification Needed:**
❓ **Question 1**: [Specific question about MCP implementation]
   - **Context**: [Why this matters for Material 3 ecosystem]
   - **Options**:
     a) [Possible answer 1 with MCP implications]
     b) [Possible answer 2 with MCP implications]
   - **Recommendation**: [Suggested approach based on MCP best practices]

❓ **Question 2**: [Continue pattern...]

## Material 3 Specification Details

### Component/Token/Icon Specification
❓ **Material 3 Standards**:
   - **Official Spec**: [Link to m3.material.io documentation]
   - **Question**: Which version of Material 3 spec to follow?
   - **Framework Variations**: How do specs differ across Web/Flutter/React/Angular?
   - **Precedent**: [How existing tools handle this]

## Data Source & Provider Clarifications

### Data Source: [GitHub API / Web Scraping / Static Data]
❓ **Provider Implementation**:
   - **Primary Source**: [Exact endpoint or URL]
   - **Fallback Strategy**: [What if primary source fails?]
   - **Rate Limiting**: [How to handle API limits?]
   - **Authentication**: [Token required? Scope needed?]
   - **Caching**: [Should data be cached? For how long?]

## Input Schema & Validation

### Parameter: [Input parameter name]
❓ **Validation Rules**:
   - Type: [string/number/boolean/enum/object]
   - Required/Optional? Currently: [unspecified/specified]
   - Format constraints: [regex, length, range]
   - Default value: [unspecified/specified]
   - Validation error messages: [Format]

**Example Zod Schema** (informational only):
```typescript
// This will be implemented in /generate-prp
z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be valid hex color")
```

## Output Format & Structure

### Output: [Response format]
❓ **Format Clarification**:
   - **Content Type**: [text/JSON/code/resource link]
   - **Structure**: [Flat/nested object/array]
   - **Size Limits**: [Maximum output size]
   - **Multiple Formats**: [Should support CSS, JSON, SCSS, etc.?]

## Framework Compatibility

### Framework: [Web/Flutter/React/Angular]
❓ **Support Level**:
   - **MVP Support**: [Which frameworks in V1?]
   - **Code Format**: [Component syntax specific to framework?]
   - **Dependencies**: [Framework-specific packages needed?]
   - **Examples**: [Where to find reference implementations?]

## Edge Cases & Error Scenarios

### Scenario 1: [Edge case description]
**Situation**: [When this could happen in MCP tool usage]
**Current Spec**: [What spec says or doesn't say]
**Question**: How should the MCP tool behave when [specific condition]?
**Impact**: [What changes in output or error response]

### Scenario 2: [Continue pattern...]

## Performance & Caching

❓ **Performance Requirements**:
   - Expected response time: [< 1s / < 2s / < 5s]
   - Concurrent MCP calls: [Expected load]
   - Cache strategy: [In-memory / file-based / none]
   - Cache TTL: [Duration if caching]

## Integration with MCP Hosts

### Host: [Claude Desktop / Cursor / VS Code]
❓ **Integration Behavior**:
   - **Tool Registration**: [Tool name and description format]
   - **User Experience**: [How will developers invoke this?]
   - **Error Display**: [How should errors be presented in IDE?]
   - **Documentation**: [What examples to include?]

## GitHub API Specifics (if applicable)

### GitHub Integration
❓ **API Clarification**:
   - **Repository**: [Which GitHub repo to access?]
   - **Branch**: [main/master/specific branch?]
   - **File Paths**: [Exact paths to component files]
   - **Rate Limit Handling**: [Authenticated vs unauthenticated]
   - **Fallback Sources**: [CDN, npm package, local cache?]

## Priority & Phasing

❓ **Implementation Priority**:
   - **Must Have** (MVP): [Core MCP tool functionality]
   - **Should Have** (V1.1): [Additional formats/frameworks]
   - **Nice to Have** (Future): [Advanced features]

## Material 3 Documentation

❓ **Reference Documentation**:
   - **Primary Docs**: [m3.material.io links]
   - **GitHub Repos**: [material-components/material-web, etc.]
   - **Examples**: [CodePen, Glitch, official demos]
   - **Community Resources**: [Stack Overflow, GitHub discussions]
```

### 4. Research Similar MCP Tools

Look for precedents in the codebase and MCP ecosystem:

```bash
# Find similar MCP tool implementations
grep -r "similar_pattern" src/tools/

# Check how existing tools handle similar cases
find src/tools -name "*.ts" -exec grep -l "pattern" {} \;

# Review provider implementations
ls src/providers/
cat src/providers/material-web-provider.ts

# Check existing tool schemas
cat src/tools/listMaterialComponents.ts
cat src/tools/getComponentCode.ts

# Research similar MCP servers
# - shadcn-ui-mcp-server (GitHub API pattern)
# - material-ui-mcp-server (documentation pattern)
# - nuxt-ui-mcp-server (component listing pattern)
```

### 5. Stakeholder Questions

Generate questions for different stakeholders:

#### For Material 3 Developers (End Users):
- Which Material 3 frameworks they primarily use
- Common pain points in current Material 3 workflow
- Expected data formats and output preferences
- Integration with existing tools (Figma, Storybook, etc.)

#### For MCP Integration Users:
- Primary host application (Claude Desktop, Cursor, VS Code)
- Workflow expectations (code generation, documentation, etc.)
- Performance requirements for IDE integration

#### For Technical Implementation:
- Existing MCP patterns to follow (see src/tools/)
- Available providers to extend (MaterialWebProvider, DocumentationProvider)
- GitHub API rate limits and authentication strategy
- Caching and performance optimization needs

### 6. Output Format

Save clarified specification as: `.specify/clarifications/[feature-number]-[feature-name]-clarified.md`

Include:
1. Original requirement
2. Questions raised
3. Answers/decisions (when available)
4. Updated requirement
5. Remaining open items

### 7. Decision Matrix

For complex clarifications, create a decision matrix:

| Question | Option A | Option B | Impact | Recommendation | Decision |
|----------|----------|----------|--------|----------------|----------|
| How to handle duplicates? | Reject all | Merge data | Data integrity | Merge with user confirmation | [Pending] |

### 8. Quality Metrics

Rate clarification completeness (1-10):
- [ ] All ambiguities addressed
- [ ] Edge cases documented
- [ ] Performance requirements clear
- [ ] User flows detailed
- [ ] Data rules specified

## Examples

### Good Clarification Process:

**Original**: "MCP tool should support multiple output formats"

**Clarification**:
❓ Which specific output formats are required?
   - Option A: CSS + JSON only (impacts: simple serialization)
   - Option B: CSS + JSON + SCSS + TypeScript (impacts: multiple formatters)
   - Option C: Pluggable format system (impacts: extensible architecture)

❓ Should all formats be returned in a single call or separate tool calls?
   - Option A: Single call returns all formats (impacts: larger response)
   - Option B: Format parameter to select one (impacts: multiple calls if needed)

**Resolution**: Support CSS, JSON, SCSS in V1 via format parameter. TypeScript in V2. Single call returns selected format only.

### Anti-patterns to Avoid
❌ Asking about specific Zod schemas (that's for /generate-prp)
❌ Proposing exact provider implementations
❌ Creating new MCP tool requirements not in original spec
❌ Over-engineering without Material 3 ecosystem validation

## Next Steps

After clarification is complete:
1. Update original specification with answers
2. Get stakeholder sign-off on clarifications
3. Run `/generate-prp` with clarified requirements
4. Proceed to implementation

## Integration with Workflow

```mermaid
graph LR
    A[/specify] --> B[/clarify]
    B --> C{All Clear?}
    C -->|No| B
    C -->|Yes| D[/generate-prp]
    D --> E[/execute-prp]
```

---
Remember: Goal is to eliminate ambiguity and ensure shared understanding before moving to technical design.