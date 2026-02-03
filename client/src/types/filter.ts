/**
 * Filter-related type definitions for game catalog filtering.
 * These interfaces support the FilterBar component and URL state management.
 */

/**
 * Default number of games to display per page/load
 */
export const PAGE_SIZE = 12;

/**
 * Represents a selectable option in filter dropdowns
 */
export interface FilterOption {
    id: number;
    name: string;
}

/**
 * Represents the current filter selections
 */
export interface FilterState {
    categoryId: number | null;
    publisherId: number | null;
}
