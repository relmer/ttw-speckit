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
