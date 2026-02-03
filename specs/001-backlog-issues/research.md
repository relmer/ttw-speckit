# Research: Tailspin Toys Backlog Implementation

**Feature**: 001-backlog-issues  
**Date**: 2026-02-02  
**Purpose**: Technical research to resolve unknowns and establish best practices

## Research Tasks

### 1. Flask Query Parameter Filtering

**Question**: How to add optional query parameters for category/publisher filtering to existing games endpoint?

**Decision**: Use Flask's `request.args.get()` with SQLAlchemy filter chaining

**Rationale**: 
- Existing `get_games_base_query()` already joins Category and Publisher tables
- SQLAlchemy Query objects support chained `.filter()` calls
- Flask's request.args handles optional parameters gracefully (returns None if missing)

**Implementation Pattern**:
```python
from flask import request

@games_bp.route('/api/games', methods=['GET'])
def get_games() -> Response:
    query = get_games_base_query()
    
    # Optional filters
    category_id = request.args.get('category_id', type=int)
    publisher_id = request.args.get('publisher_id', type=int)
    
    if category_id:
        query = query.filter(Game.category_id == category_id)
    if publisher_id:
        query = query.filter(Game.publisher_id == publisher_id)
    
    # Pagination
    limit = request.args.get('limit', default=12, type=int)
    offset = request.args.get('offset', default=0, type=int)
    
    total = query.count()
    games = query.limit(limit).offset(offset).all()
    
    return jsonify({
        'games': [g.to_dict() for g in games],
        'total': total,
        'hasMore': offset + len(games) < total
    })
```

**Alternatives Considered**:
- POST with body: Rejected - violates REST conventions for read operations
- Path parameters: Rejected - filters are optional, not resource identifiers

---

### 2. Category/Publisher List Endpoints

**Question**: Do we need new endpoints to populate filter dropdowns?

**Decision**: Add `/api/categories` and `/api/publishers` endpoints

**Rationale**:
- Category and Publisher models already have `to_dict()` methods
- Following existing pattern in `games.py` with blueprints
- Enables frontend to dynamically populate dropdowns

**Implementation Pattern**:
```python
# In routes/categories.py (new file)
@categories_bp.route('/api/categories', methods=['GET'])
def get_categories() -> Response:
    categories = db.session.query(Category).order_by(Category.name).all()
    return jsonify([c.to_dict() for c in categories])
```

**Alternatives Considered**:
- Embed categories/publishers in games response: Rejected - redundant data, larger payloads
- Hardcode options in frontend: Rejected - violates API-first principle

---

### 3. Svelte 5 State Management for Filters

**Question**: How to manage filter state with URL sync in Svelte 5?

**Decision**: Use `$state` for local state with manual URL sync via `URLSearchParams`

**Rationale**:
- Svelte 5 runes (`$state`, `$derived`) are required by constitution
- URL must reflect filter state for bookmarking (FR-010)
- No external state library needed for this scope

**Implementation Pattern**:
```svelte
<script lang="ts">
    let categoryId = $state<number | null>(null);
    let publisherId = $state<number | null>(null);
    let offset = $state(0);
    
    // Sync URL when filters change
    $effect(() => {
        const params = new URLSearchParams();
        if (categoryId) params.set('category', String(categoryId));
        if (publisherId) params.set('publisher', String(publisherId));
        if (offset > 0) params.set('offset', String(offset));
        
        const url = params.toString() ? `?${params}` : '/';
        history.replaceState({}, '', url);
    });
</script>
```

**Alternatives Considered**:
- SvelteKit stores: Not applicable - using Astro with Svelte islands
- External state library: Rejected - unnecessary complexity

---

### 4. Load More Pattern vs Traditional Pagination

**Question**: How to implement "Load more" append behavior?

**Decision**: Use `offset` parameter, append to existing `$state` array

**Rationale**:
- User confirmed "Load more" pattern (not traditional pagination)
- Games array accumulates as user clicks "Load more"
- API returns `hasMore` flag to control button visibility

**Implementation Pattern**:
```svelte
let games = $state<Game[]>([]);
let hasMore = $state(true);
const PAGE_SIZE = 12;

async function loadMore() {
    const response = await fetch(`/api/games?limit=${PAGE_SIZE}&offset=${games.length}`);
    const data = await response.json();
    games = [...games, ...data.games];
    hasMore = data.hasMore;
}
```

**Alternatives Considered**:
- Infinite scroll with intersection observer: Rejected - user specifically chose button
- Replace array on each load: Rejected - that's pagination, not "load more"

---

### 5. Accessibility: ARIA Live Regions

**Question**: How to announce dynamic content changes to screen readers?

**Decision**: Use `aria-live="polite"` on game list container with status messages

**Rationale**:
- FR-016 requires screen reader announcements for filter/pagination changes
- "polite" won't interrupt current reading
- Status text describes what changed

**Implementation Pattern**:
```svelte
<div aria-live="polite" aria-atomic="true" class="sr-only">
    {#if loading}
        Loading games...
    {:else}
        Showing {games.length} of {total} games
        {#if categoryId || publisherId}
            with filters applied
        {/if}
    {/if}
</div>
```

**Alternatives Considered**:
- aria-live="assertive": Rejected - too aggressive, interrupts user
- No live region: Rejected - fails FR-016

---

### 6. Responsive Filter Bar

**Question**: How to make horizontal filter bar work on small screens?

**Decision**: Stack filters vertically on mobile using Tailwind responsive classes

**Rationale**:
- User requested responsive design for small screens
- Tailwind's `flex-col sm:flex-row` pattern handles this cleanly
- Consistent with existing component patterns

**Implementation Pattern**:
```svelte
<div class="flex flex-col sm:flex-row gap-4 mb-6">
    <select class="flex-1 ..."><!-- Category --></select>
    <select class="flex-1 ..."><!-- Publisher --></select>
    <button class="...">Clear Filters</button>
</div>
```

**Alternatives Considered**:
- Collapsible drawer: Rejected - adds complexity, user preferred simpler approach
- Modal: Rejected - extra click to access filters

---

## Summary of Decisions

| Topic | Decision |
|-------|----------|
| API Filtering | Query params: `category_id`, `publisher_id`, `limit`, `offset` |
| Filter Data | New `/api/categories` and `/api/publishers` endpoints |
| State Management | Svelte 5 `$state` with manual URL sync via `$effect` |
| Pagination | "Load more" appends to array; API returns `hasMore` flag |
| Accessibility | `aria-live="polite"` for dynamic announcements |
| Responsive | Stack filters with `flex-col sm:flex-row` |

## Dependencies Identified

- `@axe-core/playwright` - Already installed, used in accessibility.spec.ts
- No new dependencies required
