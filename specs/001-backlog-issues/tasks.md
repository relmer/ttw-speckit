# Tasks: Tailspin Toys Backlog Implementation

**Input**: Design documents from `/specs/001-backlog-issues/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Included per Constitution Principle III (Test Coverage Required)

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1=Filtering, US2=LoadMore, US3=Accessibility)

---

## Phase 1: Setup

**Purpose**: Shared infrastructure and TypeScript types

- [x] T001 [P] Add FilterState, FilterOption interfaces and PAGE_SIZE=12 constant in client/src/types/filter.ts
- [x] T002 [P] Add GamesResponse and PaginationState interfaces in client/src/types/game.ts

**Checkpoint**: Types ready for backend and frontend development ✅

---

## Phase 2: Foundational (API Endpoints)

**Purpose**: Backend API changes that ALL user stories depend on

**⚠️ CRITICAL**: No frontend work can begin until this phase is complete

- [x] T003 Update GET /api/games with filter params (category_id, publisher_id, limit, offset) in server/routes/games.py
- [x] T004 Update GET /api/games response to include total and hasMore in server/routes/games.py
- [x] T005 [P] Create categories blueprint with GET /api/categories in server/routes/categories.py
- [x] T006 [P] Create publishers blueprint with GET /api/publishers in server/routes/publishers.py
- [x] T007 Register categories_bp and publishers_bp in server/app.py
- [x] T008 [P] Add filter/pagination tests in server/tests/test_games.py
- [x] T009 [P] Add categories endpoint tests in server/tests/test_categories.py
- [x] T010 [P] Add publishers endpoint tests in server/tests/test_publishers.py
- [x] T011 Run backend tests: .\scripts\run-server-tests.ps1

**Checkpoint**: API ready - all endpoints return expected data; tests pass ✅ (31 tests)

---

## Phase 3: User Story 1 - Filter Games (Priority: P1) 🎯 MVP

**Goal**: Users can filter games by category and publisher using dropdowns

**Independent Test**: Select filters → game list shows only matching games

**GitHub Issue**: [#5](https://github.com/relmer_microsoft/ttw-speckit/issues/5)

### Implementation for User Story 1

- [x] T012 [US1] Create FilterBar.svelte component with category/publisher dropdowns in client/src/components/FilterBar.svelte
- [x] T013 [US1] Add responsive layout (flex-col sm:flex-row) to FilterBar in client/src/components/FilterBar.svelte
- [x] T014 [US1] Add Clear Filters button to FilterBar in client/src/components/FilterBar.svelte
- [x] T015 [US1] Update GameList.svelte to fetch categories and publishers on mount in client/src/components/GameList.svelte
- [x] T016 [US1] Update GameList.svelte to pass filter state to API calls in client/src/components/GameList.svelte
- [x] T017 [US1] Add URL sync with $effect for filter state in client/src/components/GameList.svelte
- [x] T018 [US1] Update EmptyState.svelte with filter-aware messaging in client/src/components/EmptyState.svelte
- [x] T019 [US1] Add data-testid attributes to FilterBar controls in client/src/components/FilterBar.svelte
- [x] T019a [US1] Verify FilterBar integration in index.astro (GameList includes FilterBar via Svelte composition)
- [x] T020 [P] [US1] Create filtering.spec.ts E2E tests in client/e2e-tests/filtering.spec.ts (include assertion that all DB categories/publishers appear in dropdowns)

**Checkpoint**: User Story 1 complete - filters work, URL syncs, empty state shows

---

## Phase 4: User Story 2 - Load More Pagination (Priority: P2)

**Goal**: Users can load more games by clicking a button; games append to list

**Independent Test**: Click "Load more" → additional games appear below existing ones

**GitHub Issue**: [#7](https://github.com/relmer_microsoft/ttw-speckit/issues/7)

### Implementation for User Story 2

- [x] T021 [US2] Create LoadMoreButton.svelte component in client/src/components/LoadMoreButton.svelte
- [x] T022 [US2] Add loading state and disabled styling to LoadMoreButton in client/src/components/LoadMoreButton.svelte
- [x] T023 [US2] Update GameList.svelte to track offset and hasMore state in client/src/components/GameList.svelte
- [x] T024 [US2] Implement loadMore function to append games in client/src/components/GameList.svelte
- [x] T025 [US2] Conditionally render LoadMoreButton based on hasMore in client/src/components/GameList.svelte
- [x] T026 [US2] Update URL sync to include offset parameter in client/src/components/GameList.svelte
- [x] T027 [US2] Add data-testid to LoadMoreButton in client/src/components/LoadMoreButton.svelte
- [x] T028 [P] [US2] Add load-more E2E tests in client/e2e-tests/filtering.spec.ts

**Checkpoint**: User Story 2 complete - load more works with and without filters

---

## Phase 5: User Story 3 - Accessibility Compliance (Priority: P3)

**Goal**: Site meets WCAG AA standards with keyboard navigation and screen reader support

**Independent Test**: Keyboard-only navigation works; axe-core reports no violations

**GitHub Issue**: [#6](https://github.com/relmer_microsoft/ttw-speckit/issues/6)

### Implementation for User Story 3

- [ ] T029 [US3] Add aria-label attributes to FilterBar dropdowns in client/src/components/FilterBar.svelte
- [ ] T030 [US3] Add associated labels with for attribute to all form controls in client/src/components/FilterBar.svelte
- [ ] T031 [US3] Add aria-live="polite" region for dynamic announcements in client/src/components/GameList.svelte
- [ ] T032 [US3] Add status message for filter/load results in aria-live region in client/src/components/GameList.svelte
- [ ] T033 [US3] Verify focus:ring-2 focus:ring-blue-500 on all interactive elements in client/src/components/FilterBar.svelte
- [ ] T034 [US3] Verify focus states on LoadMoreButton in client/src/components/LoadMoreButton.svelte
- [ ] T035 [US3] Add keyboard event handlers (Enter, Escape) where needed in client/src/components/FilterBar.svelte
- [ ] T036 [P] [US3] Update accessibility.spec.ts with new component tests in client/e2e-tests/accessibility.spec.ts
- [ ] T037 [US3] Run axe-core audit and verify 0 violations (pass criteria: accessibilityScanResults.violations === [])

**Checkpoint**: User Story 3 complete - axe-core passes, keyboard navigation works

---

## Phase 6: Polish & Integration

**Purpose**: Final validation across all user stories

- [ ] T038 [P] Verify GameList resets offset to 0 when filters change (distinct from T017 URL sync; ensures fresh results)
- [ ] T039 Run full E2E test suite: .\scripts\run-e2e-tests.ps1
- [ ] T040 Run full backend test suite: .\scripts\run-server-tests.ps1
- [ ] T041 [P] Verify SC-001: Filter results update <1s
- [ ] T042 [P] Verify SC-002: Page load <2s
- [ ] T043 Update GitHub issues #5, #6, #7 with completion status

**Checkpoint**: All user stories complete - all tests pass, success criteria met

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup ──────────────────────────────────────┐
                                                      │
Phase 2: Foundational (API) ─────────────────────────┤
                                                      │
                    ┌─────────────────────────────────┘
                    │
                    ├── Phase 3: US1 Filtering (P1) 🎯 MVP
                    │
                    ├── Phase 4: US2 Load More (P2)
                    │
                    └── Phase 5: US3 Accessibility (P3)
                                                      │
Phase 6: Polish ─────────────────────────────────────┘
```

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US1 (Filtering) | Phase 2 complete | US2, US3 (different components) |
| US2 (Load More) | Phase 2 complete | US1, US3 (touches same file but different sections) |
| US3 (Accessibility) | US1, US2 components exist | Best after US1/US2 for complete audit |

### Parallel Opportunities

**Phase 1** (all parallel):
```
T001 ─┬─ T002
```

**Phase 2** (after T003-T004):
```
T003 → T004 → T007 → T011
       ↓
T005 ─┬─ T006 ─┬─ T008 ─┬─ T009 ─┬─ T010
```

**Phase 3-5** (after Phase 2):
```
US1: T012 → T013 → T014 → T015 → T016 → T017 → T018 → T019
                                                        ↓
                                                      T020 (parallel)

US2: T021 → T022 → T023 → T024 → T025 → T026 → T027
                                                 ↓
                                               T028 (parallel)

US3: T029 → T030 → T031 → T032 → T033 → T034 → T035
                                                  ↓
                                                T036 (parallel)
                                                  ↓
                                                T037
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational API (T003-T011)
3. Complete Phase 3: User Story 1 - Filtering (T012-T020)
4. **STOP and VALIDATE**: Filters work, tests pass
5. Can deploy/demo filtering as MVP

### Full Implementation

1. MVP + Phase 4: User Story 2 - Load More (T021-T028)
2. Phase 5: User Story 3 - Accessibility (T029-T037)
3. Phase 6: Polish & Integration (T038-T043)

---

## Task Count Summary

| Phase | Tasks | Parallel |
|-------|-------|----------|
| Phase 1: Setup | 2 | 2 |
| Phase 2: Foundational | 9 | 5 |
| Phase 3: US1 Filtering | 10 | 1 |
| Phase 4: US2 Load More | 8 | 1 |
| Phase 5: US3 Accessibility | 9 | 1 |
| Phase 6: Polish | 6 | 3 |
| **Total** | **44** | **13** |

---

## Notes

- All tasks include exact file paths per plan.md project structure
- [P] tasks can run in parallel (different files, no deps)
- [US#] label links task to user story for traceability
- Run tests after each phase checkpoint
- Constitution requires tests before commit (Principle III)
