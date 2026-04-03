# TemporalUI Developer Guide

## Project Overview

TemporalUI is a JavaScript/TypeScript UI framework that introduces *temporal awareness* as a first-class primitive. Components observe, remember, and adapt based on user interaction history.

**Status:** Greenfield / Pre-Alpha  
**Tech Stack:** TypeScript, React (initial target), framework-agnostic adapter layer planned

---

## Build Commands

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Development mode with watch
npm run dev

# Lint and format check
npm run lint
npm run format

# Type checking
npm run typecheck

# Run all tests
npm test

# Run a single test file
npm test -- --testPathPattern=filename.test.ts

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

---

## Code Style Guidelines

### General Principles
- **Simplicity First**: Make every change as simple as possible with minimal impact
- **No Lazy Fixes**: Find root causes. No temporary patches. Senior developer standards
- **Minimal Code Changes**: Only touch what's necessary to avoid introducing bugs

### TypeScript Conventions
- Use explicit return types for public functions
- Prefer interfaces over types for object shapes
- Use `readonly` for immutable data
- Avoid `any` - use `unknown` when type is truly unknown

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | kebab-case | `interaction-ledger.ts` |
| Components | PascalCase | `TemporalAdapter.tsx` |
| Hooks | camelCase, `use` prefix | `useProficiencySignal` |
| Constants | UPPER_SNAKE | `MAX_SESSION_AGE` |
| Interfaces | PascalCase, no `I` prefix | `LedgerEntry` |
| Types | PascalCase | `ProficiencyLevel` |

### Import Order
1. External libraries (React, etc.)
2. Internal packages (when monorepo)
3. Absolute path imports (`@/...`)
4. Relative imports (`./...`, `../...`)
5. Type imports (`import type`)

### Error Handling
- Use custom error classes for domain errors with `cause` property
- Use Result pattern for operations that can fail: `{ success: true; data: T } | { success: false; error: E }`
- Always include context in errors: `throw new Error(\`[ModuleName] Failed to...: ${context}\`);`

### Component Patterns
- Functional components with explicit props interface
- Use forwardRef only when necessary

### Testing Patterns
- Use describe blocks for organization
- Create test utility helpers for common mocks

---

## File Organization

```
src/
├── core/           # Core temporal engine
├── components/     # UI components (temporal-*)
├── hooks/          # React hooks (use*.ts)
├── storage/        # Persistence layer
├── types/          # Type definitions
└── utils/          # Helper functions
```

---

## Git Conventions
- Branch naming: `feature/temporal-adapter`, `fix/proficiency-signal`
- Commit messages: Imperative mood, 50 chars max, lowercase subject
- PR titles: `[Feature] Add temporal adapter component`

---

## Notes for Agents
1. This is a greenfield project - start from the PRD in `TemporalUI_PRD.md`
2. Follow the principles in Section 3 (Vision & Design Principles) of the PRD
3. Prioritize zero-configuration and local-first design
4. Ensure graceful degradation in private browsing mode
5. All temporal state must be observable via devtools
