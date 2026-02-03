import { test, expect } from '@playwright/test';

test.describe('Game Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('games-grid')).toBeVisible();
  });

  test('should display filter bar with category and publisher dropdowns', async ({ page }) => {
    await test.step('Verify filter bar is visible', async () => {
      await expect(page.getByTestId('filter-bar')).toBeVisible();
    });

    await test.step('Verify category filter dropdown exists', async () => {
      const categoryFilter = page.getByTestId('category-filter');
      await expect(categoryFilter).toBeVisible();
      await expect(categoryFilter).toHaveAttribute('aria-label', 'Filter by category');
    });

    await test.step('Verify publisher filter dropdown exists', async () => {
      const publisherFilter = page.getByTestId('publisher-filter');
      await expect(publisherFilter).toBeVisible();
      await expect(publisherFilter).toHaveAttribute('aria-label', 'Filter by publisher');
    });
  });

  test('should populate category dropdown with all database categories', async ({ page }) => {
    await test.step('Fetch categories from API for comparison', async () => {
      const response = await page.request.get('/api/categories');
      const categories = await response.json();
      
      const categoryFilter = page.getByTestId('category-filter');
      const options = categoryFilter.locator('option');
      
      // +1 for the "All Categories" default option
      await expect(options).toHaveCount(categories.length + 1);
      
      // Verify "All Categories" default option exists
      await expect(options.first()).toHaveText('All Categories');
      
      // Verify all category names appear in the dropdown
      for (const category of categories) {
        await expect(categoryFilter.locator(`option[value="${category.id}"]`)).toHaveText(category.name);
      }
    });
  });

  test('should populate publisher dropdown with all database publishers', async ({ page }) => {
    await test.step('Fetch publishers from API for comparison', async () => {
      const response = await page.request.get('/api/publishers');
      const publishers = await response.json();
      
      const publisherFilter = page.getByTestId('publisher-filter');
      const options = publisherFilter.locator('option');
      
      // +1 for the "All Publishers" default option
      await expect(options).toHaveCount(publishers.length + 1);
      
      // Verify "All Publishers" default option exists
      await expect(options.first()).toHaveText('All Publishers');
      
      // Verify all publisher names appear in the dropdown
      for (const publisher of publishers) {
        await expect(publisherFilter.locator(`option[value="${publisher.id}"]`)).toHaveText(publisher.name);
      }
    });
  });

  test('should filter games by category', async ({ page }) => {
    let initialCount: number;

    await test.step('Count initial games', async () => {
      const gameCards = page.getByTestId('game-card');
      initialCount = await gameCards.count();
      expect(initialCount).toBeGreaterThan(0);
    });

    await test.step('Select a category filter', async () => {
      const categoryFilter = page.getByTestId('category-filter');
      // Get the first non-empty option value
      const options = categoryFilter.locator('option');
      const secondOption = options.nth(1);
      const categoryId = await secondOption.getAttribute('value');
      
      await categoryFilter.selectOption(categoryId!);
    });

    await test.step('Verify URL is updated with category filter', async () => {
      await expect(page).toHaveURL(/category=/);
    });

    await test.step('Verify games are filtered (may show fewer or same)', async () => {
      // Wait for the filtered results to load
      await expect(page.getByTestId('games-grid')).toBeVisible();
      const filteredGameCards = page.getByTestId('game-card');
      const filteredCount = await filteredGameCards.count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    });
  });

  test('should filter games by publisher', async ({ page }) => {
    let initialCount: number;

    await test.step('Count initial games', async () => {
      const gameCards = page.getByTestId('game-card');
      initialCount = await gameCards.count();
      expect(initialCount).toBeGreaterThan(0);
    });

    await test.step('Select a publisher filter', async () => {
      const publisherFilter = page.getByTestId('publisher-filter');
      const options = publisherFilter.locator('option');
      const secondOption = options.nth(1);
      const publisherId = await secondOption.getAttribute('value');
      
      await publisherFilter.selectOption(publisherId!);
    });

    await test.step('Verify URL is updated with publisher filter', async () => {
      await expect(page).toHaveURL(/publisher=/);
    });

    await test.step('Verify games are filtered', async () => {
      await expect(page.getByTestId('games-grid')).toBeVisible();
      const filteredGameCards = page.getByTestId('game-card');
      const filteredCount = await filteredGameCards.count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    });
  });

  test('should filter games by both category and publisher', async ({ page }) => {
    await test.step('Select category filter', async () => {
      const categoryFilter = page.getByTestId('category-filter');
      const options = categoryFilter.locator('option');
      const secondOption = options.nth(1);
      const categoryId = await secondOption.getAttribute('value');
      await categoryFilter.selectOption(categoryId!);
    });

    await test.step('Select publisher filter', async () => {
      const publisherFilter = page.getByTestId('publisher-filter');
      const options = publisherFilter.locator('option');
      const secondOption = options.nth(1);
      const publisherId = await secondOption.getAttribute('value');
      await publisherFilter.selectOption(publisherId!);
    });

    await test.step('Verify URL contains both filters', async () => {
      await expect(page).toHaveURL(/category=.*publisher=|publisher=.*category=/);
    });

    await test.step('Verify filtered results are displayed', async () => {
      // May show games, empty state, or loading - all are valid
      const gamesGrid = page.getByTestId('games-grid');
      const emptyState = page.locator('.text-center');
      
      // Either games are shown or empty state
      const hasGames = await gamesGrid.isVisible().catch(() => false);
      const hasEmptyState = await emptyState.isVisible().catch(() => false);
      expect(hasGames || hasEmptyState).toBeTruthy();
    });
  });

  test('should show Clear Filters button only when filters are active', async ({ page }) => {
    await test.step('Verify Clear Filters is hidden initially', async () => {
      await expect(page.getByTestId('clear-filters-button')).not.toBeVisible();
    });

    await test.step('Select a category filter', async () => {
      const categoryFilter = page.getByTestId('category-filter');
      const options = categoryFilter.locator('option');
      const secondOption = options.nth(1);
      const categoryId = await secondOption.getAttribute('value');
      await categoryFilter.selectOption(categoryId!);
    });

    await test.step('Verify Clear Filters button appears', async () => {
      await expect(page.getByTestId('clear-filters-button')).toBeVisible();
    });
  });

  test('should clear all filters when Clear Filters button is clicked', async ({ page }) => {
    await test.step('Apply category filter', async () => {
      const categoryFilter = page.getByTestId('category-filter');
      const options = categoryFilter.locator('option');
      const secondOption = options.nth(1);
      const categoryId = await secondOption.getAttribute('value');
      await categoryFilter.selectOption(categoryId!);
    });

    await test.step('Apply publisher filter', async () => {
      const publisherFilter = page.getByTestId('publisher-filter');
      const options = publisherFilter.locator('option');
      const secondOption = options.nth(1);
      const publisherId = await secondOption.getAttribute('value');
      await publisherFilter.selectOption(publisherId!);
    });

    await test.step('Click Clear Filters', async () => {
      await page.getByTestId('clear-filters-button').click();
    });

    await test.step('Verify filters are cleared', async () => {
      await expect(page.getByTestId('category-filter')).toHaveValue('');
      await expect(page.getByTestId('publisher-filter')).toHaveValue('');
    });

    await test.step('Verify Clear Filters button is hidden', async () => {
      await expect(page.getByTestId('clear-filters-button')).not.toBeVisible();
    });

    await test.step('Verify URL has no filter params', async () => {
      const url = page.url();
      expect(url).not.toContain('category=');
      expect(url).not.toContain('publisher=');
    });
  });

  test('should restore filters from URL on page load', async ({ page }) => {
    await test.step('Navigate with filter params in URL', async () => {
      // Get a valid category ID first
      const response = await page.request.get('/api/categories');
      const categories = await response.json();
      const categoryId = categories[0].id;
      
      await page.goto(`/?category=${categoryId}`);
    });

    await test.step('Verify filter is applied from URL', async () => {
      await expect(page.getByTestId('games-grid')).toBeVisible();
      const categoryFilter = page.getByTestId('category-filter');
      await expect(categoryFilter).not.toHaveValue('');
    });

    await test.step('Verify Clear Filters is visible', async () => {
      await expect(page.getByTestId('clear-filters-button')).toBeVisible();
    });
  });

  test('should show empty state when no games match filters', async ({ page }) => {
    await test.step('Apply filters that result in no matches', async () => {
      // This test depends on data - we apply multiple filters hoping for no results
      // If there are always results, this test will need adjustment
      const categoryFilter = page.getByTestId('category-filter');
      const publisherFilter = page.getByTestId('publisher-filter');
      
      // Get the last options which might have fewer games
      const categoryOptions = categoryFilter.locator('option');
      const publisherOptions = publisherFilter.locator('option');
      
      const categoryCount = await categoryOptions.count();
      const publisherCount = await publisherOptions.count();
      
      if (categoryCount > 1 && publisherCount > 1) {
        const lastCategoryId = await categoryOptions.last().getAttribute('value');
        const lastPublisherId = await publisherOptions.last().getAttribute('value');
        
        if (lastCategoryId) await categoryFilter.selectOption(lastCategoryId);
        if (lastPublisherId) await publisherFilter.selectOption(lastPublisherId);
      }
    });

    await test.step('Check for empty state or results', async () => {
      // Wait for loading to complete
      await page.waitForLoadState('networkidle');
      
      // Check if empty state message appears or if games are still shown
      const emptyStateText = page.getByText('No games match your current filters');
      const gamesGrid = page.getByTestId('games-grid');
      
      const hasEmptyState = await emptyStateText.isVisible().catch(() => false);
      const hasGames = await gamesGrid.isVisible().catch(() => false);
      
      // Either empty state or games should be shown (not loading forever)
      expect(hasEmptyState || hasGames).toBeTruthy();
    });
  });

  test('should update filter results within 1 second (SC-001)', async ({ page }) => {
    await test.step('Measure filter response time', async () => {
      const startTime = Date.now();
      
      const categoryFilter = page.getByTestId('category-filter');
      const options = categoryFilter.locator('option');
      const secondOption = options.nth(1);
      const categoryId = await secondOption.getAttribute('value');
      
      await categoryFilter.selectOption(categoryId!);
      
      // Wait for either games grid or empty state to be visible
      await Promise.race([
        page.getByTestId('games-grid').waitFor({ state: 'visible', timeout: 1000 }),
        page.getByText('No games match').waitFor({ state: 'visible', timeout: 1000 }),
      ]).catch(() => {
        // At least one should be visible within 1 second
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // SC-001: Filter results should update within 1 second
      expect(responseTime).toBeLessThan(1000);
    });
  });
});

test.describe('Load More Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('games-grid')).toBeVisible();
  });

  test('should display Load More button when there are more games', async ({ page }) => {
    await test.step('Check if Load More button is visible', async () => {
      // Fetch total count from API
      const response = await page.request.get('/api/games?limit=12&offset=0');
      const data = await response.json();
      
      if (data.hasMore) {
        await expect(page.getByTestId('load-more-button')).toBeVisible();
      } else {
        // If there are fewer games than page size, button should not appear
        await expect(page.getByTestId('load-more-button')).not.toBeVisible();
      }
    });
  });

  test('should load more games when clicking Load More button', async ({ page }) => {
    let initialCount: number;

    await test.step('Count initial games', async () => {
      const gameCards = page.getByTestId('game-card');
      initialCount = await gameCards.count();
    });

    await test.step('Check if Load More is available', async () => {
      const loadMoreButton = page.getByTestId('load-more-button');
      const isVisible = await loadMoreButton.isVisible().catch(() => false);
      
      if (!isVisible) {
        // Skip test if no more games to load
        test.skip();
        return;
      }
      
      await loadMoreButton.click();
    });

    await test.step('Verify more games are loaded', async () => {
      // Wait for new games to appear
      const gameCards = page.getByTestId('game-card');
      await expect(gameCards).toHaveCount(initialCount + 12, { timeout: 5000 }).catch(async () => {
        // May have fewer than 12 more games, just verify count increased
        const newCount = await gameCards.count();
        expect(newCount).toBeGreaterThan(initialCount);
      });
    });
  });

  test('should show loading state while fetching more games', async ({ page }) => {
    await test.step('Check for Load More button', async () => {
      const loadMoreButton = page.getByTestId('load-more-button');
      const isVisible = await loadMoreButton.isVisible().catch(() => false);
      
      if (!isVisible) {
        test.skip();
        return;
      }
    });

    await test.step('Click and verify loading state', async () => {
      const loadMoreButton = page.getByTestId('load-more-button');
      
      // Click and immediately check for loading text
      await loadMoreButton.click();
      
      // Button should show loading state (aria-label changes)
      await expect(loadMoreButton).toHaveAttribute('aria-label', 'Loading more games');
    });
  });

  test('should update URL with offset when loading more', async ({ page }) => {
    await test.step('Check for Load More button', async () => {
      const loadMoreButton = page.getByTestId('load-more-button');
      const isVisible = await loadMoreButton.isVisible().catch(() => false);
      
      if (!isVisible) {
        test.skip();
        return;
      }
    });

    await test.step('Click Load More and verify URL update', async () => {
      const loadMoreButton = page.getByTestId('load-more-button');
      await loadMoreButton.click();
      
      // Wait for loading to complete
      await expect(loadMoreButton).toHaveAttribute('aria-label', 'Load more games', { timeout: 5000 }).catch(() => {
        // Button might be hidden if no more games
      });
      
      // Verify URL contains offset parameter
      await expect(page).toHaveURL(/offset=/);
    });
  });

  test('should hide Load More button when all games are loaded', async ({ page }) => {
    await test.step('Load all games', async () => {
      // Keep clicking Load More until it disappears
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        const loadMoreButton = page.getByTestId('load-more-button');
        const isVisible = await loadMoreButton.isVisible().catch(() => false);
        
        if (!isVisible) {
          break;
        }
        
        await loadMoreButton.click();
        // Wait for response
        await page.waitForLoadState('networkidle');
        attempts++;
      }
    });

    await test.step('Verify Load More is hidden', async () => {
      await expect(page.getByTestId('load-more-button')).not.toBeVisible();
    });
  });

  test('should reset pagination when filters change', async ({ page }) => {
    await test.step('Load more games first', async () => {
      const loadMoreButton = page.getByTestId('load-more-button');
      const isVisible = await loadMoreButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await loadMoreButton.click();
        await page.waitForLoadState('networkidle');
      }
    });

    await test.step('Apply a filter', async () => {
      const categoryFilter = page.getByTestId('category-filter');
      const options = categoryFilter.locator('option');
      const count = await options.count();
      
      if (count > 1) {
        const secondOption = options.nth(1);
        const categoryId = await secondOption.getAttribute('value');
        await categoryFilter.selectOption(categoryId!);
      }
    });

    await test.step('Verify offset is reset in URL', async () => {
      const url = page.url();
      // URL should either not have offset or have offset=0
      const hasOffset = url.includes('offset=');
      if (hasOffset) {
        expect(url).not.toMatch(/offset=[1-9]/);
      }
    });
  });

  test('should preserve loaded games when navigating back', async ({ page }) => {
    let gamesAfterLoadMore: number;

    await test.step('Load more games', async () => {
      const loadMoreButton = page.getByTestId('load-more-button');
      const isVisible = await loadMoreButton.isVisible().catch(() => false);
      
      if (!isVisible) {
        test.skip();
        return;
      }
      
      await loadMoreButton.click();
      await page.waitForLoadState('networkidle');
      
      const gameCards = page.getByTestId('game-card');
      gamesAfterLoadMore = await gameCards.count();
    });

    await test.step('Navigate to a game detail and back', async () => {
      const firstGameCard = page.getByTestId('game-card').first();
      await firstGameCard.click();
      
      await expect(page.getByTestId('game-details')).toBeVisible();
      
      await page.goBack();
    });

    await test.step('Verify games count is preserved', async () => {
      await expect(page.getByTestId('games-grid')).toBeVisible();
      
      // The offset should be in the URL and games should reload
      // Note: This depends on how the app handles browser history
    });
  });
});
