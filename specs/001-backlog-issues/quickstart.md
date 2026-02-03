# Quickstart: Tailspin Toys Backlog Implementation

**Feature**: 001-backlog-issues  
**Date**: 2026-02-02  
**Purpose**: Quick reference for implementation

## Overview

This feature adds three capabilities to Tailspin Toys:
1. **Filtering** - Filter games by category and publisher
2. **Load More** - Infinite scroll pagination pattern
3. **Accessibility** - WCAG AA compliance improvements

## Key Files to Modify

### Backend (Flask)

| File | Changes |
|------|---------|
| `server/routes/games.py` | Add query params: `category_id`, `publisher_id`, `limit`, `offset` |
| `server/routes/categories.py` | **NEW** - GET /api/categories endpoint |
| `server/routes/publishers.py` | **NEW** - GET /api/publishers endpoint |
| `server/app.py` | Register new blueprints |
| `server/tests/test_games.py` | Add filter/pagination tests |

### Frontend (Svelte 5)

| File | Changes |
|------|---------|
| `client/src/components/GameList.svelte` | Integrate FilterBar, LoadMoreButton, state management |
| `client/src/components/FilterBar.svelte` | **NEW** - Category/publisher dropdowns |
| `client/src/components/LoadMoreButton.svelte` | **NEW** - Load more trigger |
| `client/src/types/game.ts` | Add `GamesResponse` interface |
| `client/src/types/filter.ts` | **NEW** - FilterState, FilterOption interfaces |

### Tests

| File | Changes |
|------|---------|
| `server/tests/test_games.py` | Filter/pagination tests |
| `server/tests/test_categories.py` | **NEW** - Categories endpoint tests |
| `client/e2e-tests/filtering.spec.ts` | **NEW** - Filter E2E tests |
| `client/e2e-tests/accessibility.spec.ts` | Add tests for new components |

## API Quick Reference

```
GET /api/games?category_id=1&publisher_id=2&limit=12&offset=0
→ { games: [...], total: 50, hasMore: true }

GET /api/categories
→ [{ id: 1, name: "Strategy", ... }, ...]

GET /api/publishers
→ [{ id: 1, name: "DevGames Inc", ... }, ...]
```

## Svelte 5 Patterns to Follow

```svelte
<!-- Props with types -->
let { onFilterChange }: { onFilterChange: (filters: FilterState) => void } = $props();

<!-- State -->
let categoryId = $state<number | null>(null);
let games = $state<Game[]>([]);

<!-- Derived -->
let hasActiveFilters = $derived(categoryId !== null || publisherId !== null);

<!-- Effects for URL sync -->
$effect(() => {
    // Update URL when filters change
});

<!-- Events (NOT on:click) -->
<button onclick={() => loadMore()}>Load More</button>
```

## Dark Theme Classes

```html
<!-- Filter dropdown -->
<select class="bg-slate-800 text-slate-100 border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500">

<!-- Load more button -->
<button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">

<!-- Empty state -->
<div class="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center text-slate-400">
```

## Accessibility Requirements

- All `<select>` must have associated `<label>` with `for` attribute
- Add `aria-label` to icon-only buttons
- Use `aria-live="polite"` for dynamic content announcements
- Add `data-testid` to all interactive elements
- Ensure visible focus states with `focus:ring-2 focus:ring-blue-500`

## Test Commands

```powershell
# Backend tests
.\scripts\run-server-tests.ps1

# E2E tests
.\scripts\run-e2e-tests.ps1
```

## Implementation Order

1. **Backend First** (Constitution: API-First Design)
   - Update `/api/games` with filter/pagination
   - Add `/api/categories` endpoint
   - Add `/api/publishers` endpoint
   - Write backend tests

2. **Frontend Second**
   - Add TypeScript types
   - Create FilterBar component
   - Create LoadMoreButton component
   - Update GameList to use new components
   - Add `data-testid` attributes

3. **Accessibility Third**
   - Add ARIA labels and live regions
   - Test keyboard navigation
   - Run axe-core accessibility audit
   - Write E2E accessibility tests

4. **Integration & Polish**
   - Test filter + pagination together
   - Verify URL bookmarking
   - Run full test suite
