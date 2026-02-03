<script lang="ts">
    import { onMount } from "svelte";
    import GameCard from "./GameCard.svelte";
    import LoadingSkeleton from "./LoadingSkeleton.svelte";
    import ErrorMessage from "./ErrorMessage.svelte";
    import EmptyState from "./EmptyState.svelte";
    import FilterBar from "./FilterBar.svelte";
    import LoadMoreButton from "./LoadMoreButton.svelte";
    import type { Game, GamesResponse } from "../types/game";
    import type { FilterOption, FilterState } from "../types/filter";
    import { PAGE_SIZE } from "../types/filter";

    // State
    let games = $state<Game[]>([]);
    let loading = $state(true);
    let loadingMore = $state(false);
    let error = $state<string | null>(null);
    let categories = $state<FilterOption[]>([]);
    let publishers = $state<FilterOption[]>([]);
    let filterState = $state<FilterState>({ categoryId: null, publisherId: null });
    let total = $state(0);
    let hasMore = $state(false);
    let offset = $state(0);

    // Build API URL with filter and pagination params
    function buildApiUrl(): string {
        const params = new URLSearchParams();
        if (filterState.categoryId !== null) {
            params.set('category_id', String(filterState.categoryId));
        }
        if (filterState.publisherId !== null) {
            params.set('publisher_id', String(filterState.publisherId));
        }
        params.set('limit', String(PAGE_SIZE));
        params.set('offset', String(offset));
        return `/api/games?${params.toString()}`;
    }

    // Fetch games with current filters
    async function fetchGames(append: boolean = false): Promise<void> {
        loading = true;
        error = null;
        try {
            const response = await fetch(buildApiUrl());
            if (response.ok) {
                const data: GamesResponse = await response.json();
                if (append) {
                    games = [...games, ...data.games];
                } else {
                    games = data.games;
                }
                total = data.total;
                hasMore = data.hasMore;
            } else {
                error = `Failed to fetch data: ${response.status} ${response.statusText}`;
            }
        } catch (err) {
            error = `Error: ${err instanceof Error ? err.message : String(err)}`;
        } finally {
            loading = false;
        }
    }

    // Fetch categories for filter dropdown
    async function fetchCategories(): Promise<void> {
        try {
            const response = await fetch('/api/categories');
            if (response.ok) {
                categories = await response.json();
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    }

    // Fetch publishers for filter dropdown
    async function fetchPublishers(): Promise<void> {
        try {
            const response = await fetch('/api/publishers');
            if (response.ok) {
                publishers = await response.json();
            }
        } catch (err) {
            console.error('Failed to fetch publishers:', err);
        }
    }

    // Handle filter changes
    function handleFilterChange(newState: FilterState): void {
        filterState = newState;
        offset = 0; // Reset offset when filters change
        fetchGames(false);
        syncUrl();
    }

    // Load more games (append to existing)
    function handleLoadMore(): void {
        offset = offset + PAGE_SIZE;
        loadingMore = true;
        fetchGames(true).finally(() => {
            loadingMore = false;
            syncUrl();
        });
    }

    // Sync filter state to URL
    function syncUrl(): void {
        const params = new URLSearchParams();
        if (filterState.categoryId !== null) {
            params.set('category', String(filterState.categoryId));
        }
        if (filterState.publisherId !== null) {
            params.set('publisher', String(filterState.publisherId));
        }
        if (offset > 0) {
            params.set('offset', String(offset));
        }
        const url = params.toString() ? `?${params.toString()}` : window.location.pathname;
        history.replaceState({}, '', url);
    }

    // Read filter state from URL on mount
    function readUrlParams(): void {
        const params = new URLSearchParams(window.location.search);
        const categoryParam = params.get('category');
        const publisherParam = params.get('publisher');
        const offsetParam = params.get('offset');
        
        filterState = {
            categoryId: categoryParam ? parseInt(categoryParam, 10) : null,
            publisherId: publisherParam ? parseInt(publisherParam, 10) : null
        };
        offset = offsetParam ? parseInt(offsetParam, 10) : 0;
    }

    // Derive empty state message based on filters
    let emptyMessage = $derived(
        filterState.categoryId !== null || filterState.publisherId !== null
            ? "No games match your current filters. Try adjusting your selection."
            : "No games available at the moment."
    );

    // Derive status message for screen readers (aria-live announcements)
    let statusMessage = $derived(() => {
        if (loading && games.length === 0) {
            return "Loading games...";
        }
        if (error) {
            return `Error loading games: ${error}`;
        }
        if (games.length === 0) {
            return emptyMessage;
        }
        const filterInfo = (filterState.categoryId !== null || filterState.publisherId !== null) 
            ? " with current filters" 
            : "";
        return `Showing ${games.length} of ${total} games${filterInfo}.${hasMore ? " More games available." : ""}`;
    });

    onMount(() => {
        readUrlParams();
        fetchCategories();
        fetchPublishers();
        fetchGames(false);
    });
</script>

<div>
    <h2 class="text-2xl font-medium mb-6 text-slate-100">Featured Games</h2>
    
    <!-- Screen reader announcements for dynamic content changes -->
    <div 
        class="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        data-testid="games-status"
    >
        {statusMessage()}
    </div>
    
    <FilterBar 
        {categories}
        {publishers}
        {filterState}
        onFilterChange={handleFilterChange}
    />
    
    {#if loading && games.length === 0}
        <LoadingSkeleton count={6} />
    {:else if error}
        <ErrorMessage {error} />
    {:else if games.length === 0}
        <EmptyState message={emptyMessage} />
    {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="games-grid">
            {#each games as game (game.id)}
                <GameCard {game} />
            {/each}
        </div>
        
        {#if loadingMore}
            <div class="mt-6">
                <LoadingSkeleton count={3} />
            </div>
        {/if}
        
        <LoadMoreButton 
            loading={loadingMore} 
            {hasMore} 
            onLoadMore={handleLoadMore} 
        />
    {/if}
</div>