# Build Forge Automation Layer

## Orb Context

You are working on the **Forge** package, which provides build automation and continuous improvement for the Orb system.

**Orb Model Recap:**
- **Sol** → What the model runs on (engine/inference/brain)
- **Te** → What the model reflects on (reflection/memory)
- **Mav** → What the model accomplishes (actions/tools)
- **Luna** → What the user decides they want it to be (preferences/intent)
- **Orb** → The package everything comes in (app/shell)
- **Forge** → Build automation and continuous improvement ← **YOU ARE HERE**

## Current State

The `forge` package has been scaffolded but not yet implemented.

## Tasks

### 1. Create Scripts for Testing, Migrations, and Linting

Build automation scripts that:
- Run tests across all packages
- Execute database migrations
- Run linting and type checking
- Generate code coverage reports

**Files to create:**
- `packages/forge/scripts/test.ts`
- `packages/forge/scripts/migrate.ts`
- `packages/forge/scripts/lint.ts`

### 2. Add Automation for Scanning Stale Code

Create code scanning tools that:
- Identify unused code and dependencies
- Detect code duplication
- Find potential refactoring opportunities
- Suggest improvements based on patterns

**Files to create:**
- `packages/forge/src/codeScanner.ts`
- `packages/forge/src/refactorProposer.ts`

### 3. Integrate with Sol/Te/Mav/Luna Where Relevant

Build integrations that:
- Use Sol to analyze code patterns
- Use Te to track refactoring history and outcomes
- Use Mav to execute automated refactorings
- Respect Luna's preferences for automation aggressiveness

**Files to create:**
- `packages/forge/src/integrations/solAnalyzer.ts`
- `packages/forge/src/integrations/teTracker.ts`
- `packages/forge/src/integrations/mavExecutor.ts`
- `packages/forge/src/integrations/lunaPreferences.ts`

## Implementation Guidelines

- Forge should support all Orb roles, not belong to one
- Use appropriate Orb roles when calling other packages
- Respect Luna's boundaries (don't auto-refactor without approval)
- Log all automation actions for Te to review
- Use Mav to execute changes, not directly modify code

## Success Criteria

- [ ] Test/migration/linting scripts are functional
- [ ] Code scanner identifies stale code and opportunities
- [ ] Refactoring proposals are generated automatically
- [ ] Integrations with Sol/Te/Mav/Luna are working
- [ ] All automation respects Luna's preferences

## Next Steps

After completing this, see:
- `build-core-sol-model-orchestrator.md` - For Sol to power code analysis
- `build-core-mav-action-graph.md` - For Mav to execute refactorings

