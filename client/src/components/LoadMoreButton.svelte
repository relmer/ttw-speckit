<script lang="ts">
    interface Props {
        loading: boolean;
        hasMore: boolean;
        onLoadMore: () => void;
    }

    let { loading, hasMore, onLoadMore }: Props = $props();
</script>

{#if hasMore}
    <div class="flex justify-center mt-8">
        <button
            type="button"
            onclick={onLoadMore}
            disabled={loading}
            class="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none flex items-center gap-2"
            data-testid="load-more-button"
            aria-label={loading ? "Loading more games" : "Load more games"}
        >
            {#if loading}
                <svg 
                    class="animate-spin h-5 w-5" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <circle 
                        class="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        stroke-width="4"
                    ></circle>
                    <path 
                        class="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <span>Loading...</span>
            {:else}
                <span>Load More</span>
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path 
                        fill-rule="evenodd" 
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                        clip-rule="evenodd" 
                    />
                </svg>
            {/if}
        </button>
    </div>
{/if}
