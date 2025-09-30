# Execute PRP Command for MCP Projects

## Purpose
Execute a Product Requirements Prompt (PRP) to implement features in Node.js/TypeScript MCP servers following the comprehensive blueprint. This ensures consistent implementation that follows MCP patterns and best practices.

## Usage
```
/execute-prp [prp-filename]
```

**Examples:**
- `/execute-prp web-scraping-quick-wins`
- `/execute-prp web-scraping-quick-wins.md`

## Pre-Execution Checklist
- [ ] PRP file exists in `PRPs/` directory
- [ ] Node.js 18+ and npm installed
- [ ] No uncommitted changes (`git status`)
- [ ] Current working directory is project root
- [ ] All dependencies installed (`npm install`)

## Execution Process

### Phase 1: Load and Validate PRP (2 min)

1. **Load PRP File**
   ```bash
   cat PRPs/[feature-name].md
   ```

2. **Validate PRP Structure**
   - [ ] Contains all 7 required sections
   - [ ] Implementation tasks clearly defined
   - [ ] Acceptance criteria present
   - [ ] Code examples included
   - [ ] Timeline estimates present

3. **Verify Prerequisites**
   ```bash
   # Check Node.js version
   node --version  # Should be >= 18

   # Check TypeScript
   npx tsc --version

   # Verify existing tests pass
   npm test
   ```

### Phase 2: Create Feature Branch (1 min)

```bash
# Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/[feature-name]
```

### Phase 3: Install Dependencies (2 min)

Review PRP dependencies section and install:

```bash
# Example from web-scraping PRP
npm install bottleneck cockatiel

# Or if listed in PRP
npm install [dependencies-from-prp]
```

### Phase 4: Implementation by Task (follows PRP timeline)

#### Task Structure Pattern
For each task in the PRP:

1. **Read Task Details**
   - Objective
   - File changes
   - Implementation code examples
   - Acceptance criteria

2. **Create/Modify Files**
   ```bash
   # Create new files as specified in PRP
   # Example:
   touch src/utils/config.ts
   touch src/utils/config.test.ts
   ```

3. **Implement Code**
   - Copy code examples from PRP
   - Adapt to project structure
   - Add TODO comments for custom logic

4. **Write Tests Immediately**
   ```bash
   # Run tests for this task
   npm test src/utils/config.test.ts
   ```

5. **Validate Task Completion**
   ```bash
   # TypeScript compilation
   npm run build

   # Linting
   npm run lint

   # Tests
   npm test
   ```

6. **Commit Task**
   ```bash
   git add .
   git commit -m "feat: [TASK X] - [task description]"
   ```

#### Example Task Implementation Flow

**TASK 1: Config & Feature Flags**

```bash
# 1. Create files
touch src/utils/config.ts
touch src/utils/config.test.ts

# 2. Implement config.ts (copy from PRP section 3.1.2)
# Use Write tool to create file with PRP code

# 3. Implement tests (copy from PRP section 3.1.4)
# Use Write tool to create test file

# 4. Run tests
npm test src/utils/config.test.ts

# 5. Fix any issues
npm run build

# 6. Commit
git add src/utils/config.ts src/utils/config.test.ts
git commit -m "feat: TASK 1 - Add config system with env vars

- Created config.ts with loadConfig() function
- All env vars have sensible defaults
- ENABLE_WEB_SCRAPING flag implemented
- Tests added for config loading"
```

### Phase 5: Integration Testing (per PRP timeline)

After completing all implementation tasks:

1. **Run Full Test Suite**
   ```bash
   npm test
   ```

2. **Run Integration Tests**
   ```bash
   npm run test:integration
   ```

3. **Check Coverage**
   ```bash
   npm run test:coverage
   ```

4. **Manual Testing with MCP Inspector**
   ```bash
   npm run inspector
   ```
   - Test each MCP tool
   - Verify new functionality
   - Check error handling
   - Validate performance

### Phase 6: Documentation Updates (1 hour)

1. **Update README.md**
   - [ ] Add new environment variables
   - [ ] Update feature list
   - [ ] Add usage examples

2. **Update CLAUDE.md** (if exists)
   - [ ] Document new architecture
   - [ ] Add code references
   - [ ] Update file structure

3. **Create/Update Technical Docs**
   - [ ] Add architecture diagrams
   - [ ] Document new patterns
   - [ ] Add troubleshooting guide

### Phase 7: Final Validation (30 min)

1. **Quality Checks**
   ```bash
   # Build succeeds
   npm run build

   # All tests pass
   npm test

   # No linting errors
   npm run lint # if configured

   # Coverage meets threshold
   npm run test:coverage
   ```

2. **Performance Validation**
   ```bash
   # Start MCP Inspector
   npm run inspector

   # Test response times
   # Verify P95 < 200ms (cached)
   # Verify P95 < 2s (uncached)
   ```

3. **Functional Validation**
   - [ ] All acceptance criteria met
   - [ ] Feature flag works (enable/disable)
   - [ ] Fallback chain verified
   - [ ] Error handling tested

### Phase 8: Git Commit & Push (10 min)

1. **Review Changes**
   ```bash
   git status
   git diff
   ```

2. **Stage All Changes**
   ```bash
   git add .
   ```

3. **Create Comprehensive Commit**
   ```bash
   git commit -m "feat: implement [feature-name] following PRP

Completed all 7 tasks from PRPs/[feature-name].md:
- TASK 1: Config & Feature Flags
- TASK 2: HTTP Client with Rate Limiting
- TASK 3: Web Scraping Implementation
- TASK 4: Cache with Health Checks
- TASK 5: Parallel Fetching
- TASK 6: MCP Tool Integration
- TASK 7: Integration Tests

Success Metrics Achieved:
- 80% components return real descriptions
- P95 latency <200ms (cached), <2s (uncached)
- Fallback chain verified (GitHub → Scraping → Mock)
- 20+ unit tests, 6+ integration tests
- 80% test coverage

Breaking Changes: None
Feature Flag: ENABLE_WEB_SCRAPING=true

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

4. **Push to Remote**
   ```bash
   git push origin feature/[feature-name]
   ```

5. **Create Pull Request**
   ```bash
   # If gh CLI is available
   gh pr create --title "feat: [feature-name]" --body "$(cat <<EOF
## Summary
Implements [feature-name] following PRP blueprint in PRPs/[feature-name].md

## Changes
- List key changes from PRP tasks

## Testing
- All tests passing (20+ unit, 6+ integration)
- Coverage: 80%+
- Manual testing via MCP Inspector complete

## Performance
- P95 latency: <200ms (cached), <2s (uncached)

## Documentation
- README.md updated with new env vars
- Code comments added for complex logic

## Checklist
- [x] All PRP tasks completed
- [x] Tests passing
- [x] Documentation updated
- [x] No breaking changes
- [x] Feature flag implemented

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
   ```

## Common Implementation Patterns for MCP Projects

### 1. Configuration Service Pattern
```typescript
// src/utils/config.ts
export interface Config {
  enableFeature: boolean;
  featureParam: number;
}

export function loadConfig(): Config {
  return {
    enableFeature: process.env.ENABLE_FEATURE === 'true',
    featureParam: parseInt(process.env.FEATURE_PARAM || '10', 10),
  };
}

export const config = loadConfig();
```

### 2. Provider Pattern
```typescript
// src/providers/[feature]-provider.ts
export class FeatureProvider {
  private cache: CacheManager;
  private httpClient: HttpClient;

  constructor() {
    this.cache = new CacheManager(config.cacheTTL);
    this.httpClient = new HttpClient();
  }

  async fetchData(id: string): Promise<Data> {
    // Check cache first
    const cached = this.cache.get(id);
    if (cached) return cached;

    // Fetch from source
    const data = await this.httpClient.get(`/api/${id}`);

    // Cache and return
    this.cache.set(id, data);
    return data;
  }
}

export const featureProvider = new FeatureProvider();
```

### 3. MCP Tool Handler Pattern
```typescript
// src/tools/[feature]-tool.ts
import { z } from 'zod';

export const featureToolSchema = z.object({
  param1: z.string().describe("Description for AI"),
  param2: z.number().optional().default(10),
});

export async function featureToolHandler(
  args: z.infer<typeof featureToolSchema>
) {
  try {
    logger.info('feature-tool', `Called with: ${JSON.stringify(args)}`);

    const result = await featureProvider.fetchData(args.param1);

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2),
      }],
    };
  } catch (error) {
    logger.error('feature-tool', 'Failed', error);
    return {
      content: [{
        type: 'text' as const,
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }],
      isError: true,
    };
  }
}
```

### 4. Test Pattern
```typescript
// src/[path]/[file].test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('FeatureProvider', () => {
  let provider: FeatureProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new FeatureProvider();
  });

  it('should fetch data successfully', async () => {
    const result = await provider.fetchData('test-id');
    expect(result).toBeDefined();
  });

  it('should use cache on second request', async () => {
    await provider.fetchData('test-id');
    const result2 = await provider.fetchData('test-id');

    // Verify cache was used (implementation specific)
    expect(result2).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    vi.spyOn(provider as any, 'httpClient').mockRejectedValue(new Error('Network error'));

    await expect(provider.fetchData('bad-id')).rejects.toThrow('Network error');
  });
});
```

## Validation Checkpoints

### After Each Task
- [ ] TypeScript compiles: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] No console errors in output

### After Phase 4 (All Tasks)
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Coverage ≥ 80%
- [ ] MCP Inspector manual test successful

### Before PR
- [ ] All acceptance criteria met
- [ ] Performance metrics validated
- [ ] Documentation complete
- [ ] No uncommitted files
- [ ] Commit messages follow convention

## Error Recovery

### Build Fails
1. Check TypeScript errors: `npx tsc --noEmit`
2. Verify imports are correct
3. Check for missing dependencies: `npm install`

### Tests Fail
1. Read error message carefully
2. Check if test setup is correct (mocks, fixtures)
3. Verify test matches implementation
4. Run single test: `npm test -- [test-file]`

### Integration Issues
1. Verify all files created per PRP
2. Check exports/imports are correct
3. Ensure services are initialized
4. Check MCP server startup logs

### Performance Issues
1. Check cache is working: Add debug logs
2. Verify rate limiting not too aggressive
3. Check for N+1 query patterns
4. Use profiling tools if needed

## Success Criteria Checklist

From the PRP document:

- [ ] **Feature-Level**
  - [ ] 80%+ data quality improvement (per PRP metric)
  - [ ] Performance targets met (P95 < 200ms cached, < 2s uncached)
  - [ ] Fallback chain verified
  - [ ] Feature flag works

- [ ] **Technical**
  - [ ] TypeScript compiles with no errors
  - [ ] 20+ unit tests pass
  - [ ] 6+ integration tests pass
  - [ ] 80% test coverage
  - [ ] No linting errors

- [ ] **Operational**
  - [ ] MCP Inspector testing successful
  - [ ] Claude Desktop integration tested (if applicable)
  - [ ] Metrics/logging in place
  - [ ] Documentation updated

## Timeline Reference

Use PRP timeline as guide. Example from web-scraping PRP:

- **Week 1**: Foundation (Config, HttpClient, Cache)
- **Week 2**: Implementation (Scraping, Parallel Fetching)
- **Week 3**: Integration & Testing
- **Week 4**: Validation & Documentation

Adjust based on complexity and team capacity.

## Tips for Efficient Execution

1. **Don't Deviate from PRP**: The PRP was carefully designed. Stick to it.

2. **Test as You Go**: Don't wait until the end to write tests.

3. **Commit Frequently**: One commit per task makes rollback easier.

4. **Use PRP Code Examples**: Don't reinvent - copy and adapt from PRP.

5. **Validate Progressively**: Run tests after each task, not just at the end.

6. **Ask Questions Early**: If PRP is unclear, clarify before implementing.

7. **Update PRP if Needed**: If you discover issues, update PRP for future reference.

## Common Pitfalls to Avoid

1. ❌ Skipping tests to "save time"
2. ❌ Implementing features not in PRP scope
3. ❌ Creating new patterns without justification
4. ❌ Ignoring acceptance criteria
5. ❌ Not using feature flags
6. ❌ Forgetting to update documentation
7. ❌ Committing untested code

---

**Goal**: Transform comprehensive PRP into working, tested, production-ready MCP server features.

**Estimated Time**: Follow PRP timeline (typically 2-3 weeks for medium features)

**Output**: Fully implemented feature with tests, documentation, and PR ready for review.