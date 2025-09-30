# Tests

Test files for Material 3 MCP Server functionality.

## Running Tests

```bash
# Individual tests
node tests/test-new-tools.js              # Test theme generation and component suggestions
node tests/test-flutter-chat.js           # Test Flutter optimization for chat app
node tests/test-flutter-optimization.js   # Test Flutter defaults
node tests/test-cache-versioning.js       # Test cache freshness strategy
node tests/test-persistent-improvements.js # Test persistent cache performance
node tests/test-metadata-parsing.js       # Test Dart/TypeScript parsers
node tests/test-list-components.js        # Test component listing
node tests/test-icons.js                  # Test icon search
node tests/manual-test.js                 # Manual testing script
```

## Test Categories

### New Tools (Latest)
- `test-new-tools.js` - Tests for `generate_theme_from_color` and `suggest_components_for_use_case`
- `test-flutter-chat.js` - Flutter chat app use case testing

### Core Functionality
- `test-flutter-optimization.js` - Flutter framework defaults
- `test-list-components.js` - Component listing with filters
- `test-icons.js` - Material Icons search

### Performance & Caching
- `test-cache-versioning.js` - Cache versioning system
- `test-persistent-improvements.js` - Persistent cache benchmarks

### Metadata Parsing
- `test-metadata-parsing.js` - Full metadata parser tests
- `test-metadata-quick.js` - Quick parser tests (no GitHub API)

## Test Documentation
- `test-fixes.md` - History of test fixes
- See `docs/TESTING.md` and `docs/TESTING_RESULTS.md` for full testing documentation