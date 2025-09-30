# Execute PRP Command for Bukeer

## Purpose
Execute a Product Requirements Prompt (PRP) to implement a feature in Bukeer following the comprehensive blueprint. This ensures consistent implementation that follows all Bukeer patterns and conventions.

## Usage
When the user requests: "Execute PRP [prp-filename]" or "Implement the PRP for [feature]"

## Pre-Execution Checklist
- [ ] PRP file exists in `/PRPs/` directory
- [ ] All required services are available
- [ ] Test environment is set up
- [ ] No uncommitted changes (check with `git status`)

## Execution Process

### 1. Load and Validate PRP
```bash
# Load the PRP
cat PRPs/[feature-name]-[date].md

# Verify all sections are complete
# Ensure implementation blueprint is clear
```

### 2. Create Feature Branch
```bash
./flow.sh dev feature/[feature-name]
```

### 3. Implementation Order

#### Phase 1: Backend Foundation
1. **Database Schema** (if needed)
   - Create migration file
   - Add RLS policies
   - Test with Supabase CLI

2. **Service Layer**
   - Create service file: `lib/services/[feature]_service.dart`
   - Implement CRUD operations
   - Add permission checks
   - Handle multi-currency if needed

3. **Integration with AppServices**
   - Add service to `app_services.dart`
   - Initialize in `_initializeServices()`

#### Phase 2: Frontend Implementation
4. **UI Components**
   - Create list widget (if needed)
   - Create detail widget (if needed)
   - Create modal/form (if needed)
   - Use Bukeer Design System exclusively

5. **Navigation**
   - Add routes to `app_router.dart`
   - Update navigation menu if needed

#### Phase 3: Testing & Validation
6. **Write Tests**
   - Service tests: `test/services/[feature]_service_test.dart`
   - Widget tests: `test/widgets/[feature]_widget_test.dart`
   - Integration tests if complex

7. **Run Validation Loop**
   ```bash
   # From PRP validation section
   flutter analyze lib/
   flutter test
   flutter test --coverage
   ```

### 4. Progressive Validation
After each phase, run:
```bash
# Syntax check
flutter analyze lib/

# Format check
dart format lib/ --set-exit-if-changed

# Relevant tests
flutter test test/[relevant_tests]
```

### 5. Common Implementation Patterns

#### Service Implementation
```dart
class [Feature]Service extends BaseService {
  // Always follow singleton pattern
  static final [Feature]Service _instance = [Feature]Service._internal();
  factory [Feature]Service() => _instance;
  [Feature]Service._internal();

  // Always check permissions first
  Future<[Model]> create(Map<String, dynamic> data) async {
    if (!appServices.authorization.hasPermission('[feature]:create')) {
      throw UnauthorizedException();
    }
    // Implementation
  }
}
```

#### Widget Implementation
```dart
class [Feature]ListWidget extends StatefulWidget {
  // Use BukeerListPage pattern
  // Include search, filters, pagination
  // Use BukeerTable for data display
}
```

### 6. Checklist During Implementation
- [ ] Following PRP blueprint exactly
- [ ] Using existing Bukeer patterns
- [ ] All strings are constants (no hardcoding)
- [ ] Permission checks implemented
- [ ] Multi-currency handled (if applicable)
- [ ] Using AppServices (not FFAppState)
- [ ] Using Bukeer Design System
- [ ] Tests written alongside code

### 7. Post-Implementation
1. **Final Validation**
   ```bash
   flutter analyze
   flutter test
   flutter test --coverage
   ```

2. **Manual Testing**
   ```bash
   ./flow.sh run
   ```
   - Test all user flows
   - Verify permissions work
   - Check responsive design
   - Test error cases

3. **Documentation Update**
   - Update relevant docs in `/docs/`
   - Add to feature list if major feature

4. **Commit and PR**
   ```bash
   ./flow.sh save "feat: implement [feature] following PRP"
   ./flow.sh pr
   ```

## Error Recovery

### If tests fail:
1. Check error message carefully
2. Verify following Bukeer patterns
3. Ensure all dependencies injected
4. Check permission logic

### If UI doesn't match design:
1. Verify using Bukeer components
2. Check BukeerColors and BukeerTypography
3. Use BukeerSpacing for consistency

### If performance issues:
1. Check for N+1 queries
2. Implement pagination if large datasets
3. Use indexes on database queries

## Success Criteria
- [ ] All PRP requirements implemented
- [ ] All tests passing
- [ ] Code coverage maintained (>80%)
- [ ] No linting errors
- [ ] PR approved without major changes

## Common Pitfalls to Avoid
1. ❌ Implementing outside PRP scope
2. ❌ Creating new patterns
3. ❌ Skipping permission checks
4. ❌ Hardcoding configuration
5. ❌ Missing error handling
6. ❌ Forgetting multi-tenant isolation

---
Goal: Transform comprehensive PRP into working, tested, production-ready code.