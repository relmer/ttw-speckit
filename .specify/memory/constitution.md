<!--
SYNC IMPACT REPORT
==================
Version change: N/A → 1.0.0 (initial ratification)
Modified principles: N/A (initial creation)
Added sections:
  - Core Principles (5 principles)
  - Technology Constraints
  - Development Workflow
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (compatible - uses generic Constitution Check)
  - .specify/templates/spec-template.md ✅ (compatible - requirements/testing structure aligned)
  - .specify/templates/tasks-template.md ✅ (compatible - phase structure supports principles)
Follow-up TODOs: None
-->

# Tailspin Toys Constitution

## Core Principles

### I. API-First Design
All features MUST be exposed through the Flask REST API before frontend implementation.
- Endpoints follow pattern: `GET/POST/PUT/DELETE /api/<resource>[/<id>]`
- All routes MUST use Flask blueprints registered in `server/app.py`
- Routes MUST use `get_<resource>_base_query()` helper for reusable query logic with joins
- Response format: JSON via `jsonify()` with appropriate HTTP status codes

### II. Type Safety
All code MUST include explicit type annotations for maintainability.
- Python: Type hints required on all function parameters and return values
- TypeScript: Explicit interfaces for component props and API responses
- SQLAlchemy models MUST include `to_dict()` method for JSON serialization
- Property name conversion: snake_case (Python) → camelCase (JSON/TypeScript)

### III. Test Coverage Required
Tests MUST pass before any commit; new features MUST include corresponding tests.
- Backend: Python unittest with in-memory SQLite (`sqlite:///:memory:`)
- Frontend: Playwright E2E tests using `getByTestId()` locators
- All interactive UI elements MUST have `data-testid` attributes
- Run tests via `scripts/run-server-tests.ps1` and `scripts/run-e2e-tests.ps1`

### IV. Svelte 5 Runes Only
Frontend components MUST use Svelte 5 runes-based reactivity exclusively.
- Props: `let { prop }: { prop: Type } = $props();`
- State: `let value = $state(initialValue);`
- Derived: `let computed = $derived(expression);`
- Events: Use `onclick`, `onsubmit` attributes (NOT `on:click` directives)
- Astro integration: Always use `client:only="svelte"` directive

### V. Dark Theme Consistency
All UI MUST follow the established dark theme using Tailwind CSS v4.
- Background: `bg-slate-800`, `bg-slate-900`
- Text: `text-slate-100` (primary), `text-slate-300` (secondary), `text-slate-400` (muted)
- Borders: `border-slate-700`
- No light theme variants; dark mode is the only supported theme

## Technology Constraints

| Layer | Technology | Version/Notes |
|-------|------------|---------------|
| Backend | Flask + SQLAlchemy | Port 5100, SQLite database in `data/` |
| Frontend | Astro + Svelte 5 | Port 4321, SSR mode with Node adapter |
| Styling | Tailwind CSS | v4, utility classes only |
| Testing | unittest + Playwright | Backend unit tests, E2E frontend tests |

**Dependency Management**:
- Python: `server/requirements.txt`
- Node: `client/package.json`
- Setup: `scripts/setup-env.ps1` (Windows) or `scripts/setup-env.sh` (Unix)

## Development Workflow

1. **Before coding**: Review `.github/instructions/*.instructions.md` for technology-specific patterns
2. **API changes**: Create/update blueprint → register in `app.py` → add tests in `server/tests/`
3. **UI changes**: Create Svelte component with `$props()` → add `data-testid` → integrate in Astro page
4. **Before commit**: Run both test suites; update documentation if patterns change
5. **Git discipline**: Do NOT commit/push unless explicitly instructed by user

## Governance

This constitution supersedes conflicting guidance in other documentation. Amendments require:
1. Documented rationale for the change
2. Version increment following semantic versioning
3. Update to `.github/copilot-instructions.md` if principles affect daily development

All code reviews and AI-generated code MUST verify compliance with these principles.

**Version**: 1.0.0 | **Ratified**: 2026-02-02 | **Last Amended**: 2026-02-02
