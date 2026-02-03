# Tailspin Toys Development Guidelines

A game crowdfunding platform with Flask/SQLAlchemy backend and Astro/Svelte 5 frontend.

## Architecture Overview

```
server/          → Flask API (port 5100) with SQLAlchemy ORM
  models/        → Game, Publisher, Category with to_dict() serialization
  routes/        → Blueprints: games_bp, publishers_bp (pattern: get_<resource>_base_query())
client/          → Astro SSR (port 4321) with Svelte 5 components
  src/pages/     → File-based routing (*.astro files)
  src/components/→ Svelte 5 components using $props(), $state, $derived
data/            → SQLite database (tailspin-toys.db)
```

**Data Flow**: Astro pages → fetch `/api/*` → Flask routes → SQLAlchemy → SQLite

## Agent Behavior

- **Explore first** before generating code; create todo lists for multi-step tasks
- Use `.github/instructions/*.instructions.md` files for technology-specific patterns
- Use absolute paths for all scripts and commands
- **Do NOT commit/push** unless explicitly instructed

## Scripts (use `.ps1` on Windows, `.sh` on Linux/macOS)

| Command | Purpose |
|---------|---------|
| `.\scripts\start-app.ps1` | Start both servers (runs setup-env first) |
| `.\scripts\run-server-tests.ps1` | Run Python unit tests |
| `.\scripts\run-e2e-tests.ps1` | Run Playwright E2E tests |

## Key Patterns

### Flask Routes (`server/routes/`)
```python
def get_games_base_query() -> Query:  # Reusable query with joins
    return db.session.query(Game).join(Publisher, isouter=True).join(Category, isouter=True)

@games_bp.route('/api/games/<int:id>')
def get_game(id: int) -> tuple[Response, int] | Response:  # Type hints required
```

### SQLAlchemy Models (`server/models/`)
- Include `to_dict()` for JSON serialization (converts `star_rating` → `starRating`)
- Use `@validates` decorators for field validation

### Svelte 5 Components (`client/src/components/`)
```svelte
let { game }: { game: Game } = $props();  <!-- Typed props with runes -->
<button onclick={() => ...}>              <!-- Event attributes, not on:click -->
```
- Add `data-testid` attributes to all interactive elements for Playwright

### Astro Pages (`client/src/pages/`)
```astro
<GameList client:only="svelte" />  <!-- Always use client:only for Svelte -->
```

### Styling
- Dark theme exclusively: `bg-slate-800`, `text-slate-100`, `border-slate-700`
- Tailwind CSS v4 utility classes only

## Testing Requirements

**Before committing**, run both test suites:

1. **Backend**: `.\scripts\run-server-tests.ps1` - Uses in-memory SQLite, see [test_games.py](server/tests/test_games.py) for patterns
2. **Frontend**: `.\scripts\run-e2e-tests.ps1` - Uses `getByTestId()` locators, see [games.spec.ts](client/e2e-tests/games.spec.ts)

## Adding New Features

1. **New API endpoint**: Create blueprint in `server/routes/`, register in `app.py`, add tests
2. **New page**: Create `*.astro` in `client/src/pages/`, use `Layout.astro`
3. **New component**: Create Svelte 5 file with `$props()`, add `data-testid` attributes
