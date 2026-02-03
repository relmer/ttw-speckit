# Implementation Plan: Tailspin Toys Backlog Implementation

**Branch**: `001-backlog-issues` | **Date**: 2026-02-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-backlog-issues/spec.md`

**Tracking Issues**:
- [#5 - Filter games](https://github.com/relmer_microsoft/ttw-speckit/issues/5)
- [#6 - Accessibility](https://github.com/relmer_microsoft/ttw-speckit/issues/6)
- [#7 - Pagination](https://github.com/relmer_microsoft/ttw-speckit/issues/7)

## Summary

Implement three user stories for the Tailspin Toys game catalog: (1) Filter games by category and publisher using a responsive horizontal filter bar, (2) "Load more" infinite scroll pagination pattern, and (3) Accessibility improvements including keyboard navigation, ARIA labels, and WCAG AA compliance. All features follow API-first design with Flask backend and Svelte 5 frontend.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript (frontend)  
**Primary Dependencies**: Flask, SQLAlchemy, Astro, Svelte 5, Tailwind CSS v4  
**Storage**: SQLite database in `data/tailspin-toys.db`  
**Testing**: Python unittest (backend), Playwright E2E (frontend)  
**Target Platform**: Web (desktop and mobile responsive)  
**Project Type**: Web application (Flask API + Astro/Svelte frontend)  
**Performance Goals**: Filter results <1s, page load <2s (from spec SC-001, SC-002)  
**Constraints**: WCAG AA compliance, dark theme only, Svelte 5 runes syntax  
**Scale/Scope**: Game catalog with Category and Publisher filtering, infinite scroll

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Compliance |
|-----------|-------------|------------|
| I. API-First Design | Endpoints before frontend | ✅ Will add `/api/games` query params for filtering/pagination before UI |
| II. Type Safety | Type hints on all code | ✅ Python type hints, TypeScript interfaces for filter/pagination state |
| III. Test Coverage | Tests before commit | ✅ Backend unit tests for filter API, Playwright E2E for UI |
| IV. Svelte 5 Runes | `$props()`, `$state`, `$derived` | ✅ Filter/pagination components will use runes syntax |
| V. Dark Theme | Tailwind slate palette | ✅ All new UI follows existing dark theme patterns |

**Gate Status**: ✅ PASSED - No violations; proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-backlog-issues/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI specs)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
server/
├── routes/
│   └── games.py         # Add filter/pagination query params
├── tests/
│   └── test_games.py    # Add filter/pagination tests
└── app.py               # No changes needed (blueprint already registered)

client/
├── src/
│   ├── components/
│   │   ├── GameList.svelte      # Update: integrate filters + load more
│   │   ├── FilterBar.svelte     # NEW: category/publisher dropdowns
│   │   ├── LoadMoreButton.svelte # NEW: load more trigger
│   │   └── EmptyState.svelte    # Update: filter-aware messaging
│   ├── pages/
│   │   └── index.astro          # Update: pass filter state to GameList
│   └── types/
│       └── game.ts              # Update: add filter/pagination types
└── e2e-tests/
    ├── filtering.spec.ts        # NEW: filter E2E tests
    └── accessibility.spec.ts    # Update: add new component tests
```

**Structure Decision**: Web application structure (Option 2) - extends existing `server/` and `client/` directories with new components and API enhancements.

## Complexity Tracking

> No Constitution violations - this section is not applicable.

---

## Phase 0 Output: Research

See [research.md](research.md) for detailed technical decisions:

| Topic | Decision |
|-------|----------|
| API Filtering | Query params: `category_id`, `publisher_id`, `limit`, `offset` |
| Filter Data | New `/api/categories` and `/api/publishers` endpoints |
| State Management | Svelte 5 `$state` with manual URL sync via `$effect` |
| Pagination | "Load more" appends to array; API returns `hasMore` flag |
| Accessibility | `aria-live="polite"` for dynamic announcements |
| Responsive | Stack filters with `flex-col sm:flex-row` |

---

## Phase 1 Output: Design Artifacts

| Artifact | Description |
|----------|-------------|
| [data-model.md](data-model.md) | Entity definitions, TypeScript types, state transitions |
| [contracts/games-api.yaml](contracts/games-api.yaml) | OpenAPI 3.0 specification for updated endpoints |
| [quickstart.md](quickstart.md) | Implementation quick reference |

---

## Post-Design Constitution Re-Check

| Principle | Design Verification | Status |
|-----------|---------------------|--------|
| I. API-First | OpenAPI contract defines all endpoints before UI work | ✅ |
| II. Type Safety | TypeScript interfaces defined in data-model.md | ✅ |
| III. Test Coverage | Test files identified in project structure | ✅ |
| IV. Svelte 5 Runes | Patterns documented in quickstart.md | ✅ |
| V. Dark Theme | CSS classes documented in quickstart.md | ✅ |

**Post-Design Gate Status**: ✅ PASSED - Ready for Phase 2 (tasks)

---

## Next Steps

Run `/speckit.tasks` to generate the task breakdown for implementation.
