# Data Model: Tailspin Toys Backlog Implementation

**Feature**: 001-backlog-issues  
**Date**: 2026-02-02  
**Purpose**: Entity definitions, relationships, and state structures

## Existing Entities (No Changes)

### Game
Already defined in `server/models/game.py`

| Field | Type | Notes |
|-------|------|-------|
| id | Integer | Primary key |
| title | String(100) | Required |
| description | Text | Required |
| star_rating | Float | Optional |
| category_id | Integer | FK to categories.id |
| publisher_id | Integer | FK to publishers.id |

**Relationships**: `category` → Category, `publisher` → Publisher

### Category
Already defined in `server/models/category.py`

| Field | Type | Notes |
|-------|------|-------|
| id | Integer | Primary key |
| name | String(100) | Required, unique |
| description | Text | Optional |

**Relationships**: `games` → List[Game]

### Publisher
Already defined in `server/models/publisher.py`

| Field | Type | Notes |
|-------|------|-------|
| id | Integer | Primary key |
| name | String(100) | Required, unique |
| description | Text | Optional |

**Relationships**: `games` → List[Game]

---

## New TypeScript Types (Frontend)

### FilterState
Represents current filter selections in the UI.

```typescript
// client/src/types/filter.ts

export interface FilterState {
    categoryId: number | null;
    publisherId: number | null;
}
```

### PaginationState
Represents current pagination/load-more state.

```typescript
// client/src/types/pagination.ts

export interface PaginationState {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
}
```

### GamesResponse
API response structure for paginated games list.

```typescript
// client/src/types/game.ts (extend existing file)

export interface GamesResponse {
    games: Game[];
    total: number;
    hasMore: boolean;
}
```

### FilterOption
Generic option for dropdown selects.

```typescript
// client/src/types/filter.ts

export interface FilterOption {
    id: number;
    name: string;
}
```

---

## API Response Structures

### GET /api/games (Updated)

**Before** (current):
```json
[
    { "id": 1, "title": "...", ... },
    { "id": 2, "title": "...", ... }
]
```

**After** (with pagination):
```json
{
    "games": [
        { "id": 1, "title": "...", ... },
        { "id": 2, "title": "...", ... }
    ],
    "total": 50,
    "hasMore": true
}
```

### GET /api/categories (New)
```json
[
    { "id": 1, "name": "Strategy", "description": "...", "game_count": 5 },
    { "id": 2, "name": "Card Game", "description": "...", "game_count": 3 }
]
```

### GET /api/publishers (New)
```json
[
    { "id": 1, "name": "DevGames Inc", "description": "...", "game_count": 4 },
    { "id": 2, "name": "Scrum Masters", "description": "...", "game_count": 2 }
]
```

---

## State Transitions

### Filter State Machine

```
IDLE → [select category] → FILTERED_BY_CATEGORY
IDLE → [select publisher] → FILTERED_BY_PUBLISHER
FILTERED_BY_* → [select other filter] → FILTERED_BY_BOTH
FILTERED_BY_* → [clear filters] → IDLE
Any State → [load more] → Same State (with more games loaded)
```

### UI Loading States

```
INITIAL_LOADING → [games fetched] → SHOWING_GAMES
SHOWING_GAMES → [filter changed] → LOADING_FILTERED → SHOWING_GAMES
SHOWING_GAMES → [load more clicked] → LOADING_MORE → SHOWING_GAMES
Any State → [error] → ERROR_STATE
SHOWING_GAMES (0 games) → EMPTY_STATE
```

---

## Validation Rules

### Filter Parameters (Backend)
- `category_id`: Optional integer, must exist in categories table if provided
- `publisher_id`: Optional integer, must exist in publishers table if provided
- `limit`: Optional integer, default 12, max 100
- `offset`: Optional integer, default 0, must be >= 0

### URL Parameters (Frontend)
- `category`: Optional, maps to category_id
- `publisher`: Optional, maps to publisher_id
- `offset`: Optional, tracks loaded games count
