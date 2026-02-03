<script lang="ts">
    import type { FilterOption, FilterState } from '../types/filter';

    interface Props {
        categories: FilterOption[];
        publishers: FilterOption[];
        filterState: FilterState;
        onFilterChange: (newState: FilterState) => void;
    }

    let { categories, publishers, filterState, onFilterChange }: Props = $props();

    function handleCategoryChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        const value = target.value ? parseInt(target.value, 10) : null;
        onFilterChange({
            ...filterState,
            categoryId: value
        });
    }

    function handlePublisherChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        const value = target.value ? parseInt(target.value, 10) : null;
        onFilterChange({
            ...filterState,
            publisherId: value
        });
    }

    function clearFilters(): void {
        onFilterChange({
            categoryId: null,
            publisherId: null
        });
    }

    let hasActiveFilters = $derived(
        filterState.categoryId !== null || filterState.publisherId !== null
    );
</script>

<div 
    class="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700"
    data-testid="filter-bar"
>
    <div class="flex-1">
        <label 
            for="category-filter" 
            class="block text-sm font-medium text-slate-300 mb-1"
        >
            Category
        </label>
        <select
            id="category-filter"
            class="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
            value={filterState.categoryId ?? ''}
            onchange={handleCategoryChange}
            data-testid="category-filter"
            aria-label="Filter by category"
        >
            <option value="">All Categories</option>
            {#each categories as category (category.id)}
                <option value={category.id}>{category.name}</option>
            {/each}
        </select>
    </div>

    <div class="flex-1">
        <label 
            for="publisher-filter" 
            class="block text-sm font-medium text-slate-300 mb-1"
        >
            Publisher
        </label>
        <select
            id="publisher-filter"
            class="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
            value={filterState.publisherId ?? ''}
            onchange={handlePublisherChange}
            data-testid="publisher-filter"
            aria-label="Filter by publisher"
        >
            <option value="">All Publishers</option>
            {#each publishers as publisher (publisher.id)}
                <option value={publisher.id}>{publisher.name}</option>
            {/each}
        </select>
    </div>

    {#if hasActiveFilters}
        <div class="flex items-end">
            <button
                type="button"
                onclick={clearFilters}
                class="w-full sm:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                data-testid="clear-filters-button"
                aria-label="Clear all filters"
            >
                Clear Filters
            </button>
        </div>
    {/if}
</div>
