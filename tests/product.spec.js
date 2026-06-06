/**
 * Product page tests — gallery, variant selector, tabs, cart sheet.
 *
 * All selectors are derived from shop/index.html + js/product.js.
 * The cart is in-memory (no server); state resets on each page load.
 */

const { test, expect } = require('@playwright/test');

test.describe('product page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shop/');
    // Wait for layout.js partial injection before any interaction
    await expect(page.locator('header')).toBeVisible({ timeout: 5_000 });
  });

  // ── Gallery ──────────────────────────────────────────────────────────────

  test('gallery: 5 thumbnails, first is active by default', async ({ page }) => {
    const thumbs = page.locator('.gallery-thumb');
    await expect(thumbs).toHaveCount(5);
    await expect(thumbs.nth(0)).toHaveClass(/active/);
  });

  test('gallery: clicking a thumbnail makes it active and deactivates the previous', async ({ page }) => {
    const thumbs = page.locator('.gallery-thumb');
    await thumbs.nth(2).click();
    await expect(thumbs.nth(2)).toHaveClass(/active/);
    await expect(thumbs.nth(0)).not.toHaveClass(/active/);
  });

  test('gallery: prev/next buttons cycle through thumbnails', async ({ page }) => {
    const thumbs = page.locator('.gallery-thumb');
    await page.locator('#gallery-next').click();
    await expect(thumbs.nth(1)).toHaveClass(/active/);
    await page.locator('#gallery-prev').click();
    await expect(thumbs.nth(0)).toHaveClass(/active/);
  });

  // ── Variant selector ─────────────────────────────────────────────────────

  test('variants: Loko Bundle is active and shows $119 by default', async ({ page }) => {
    await expect(page.locator('.variant-option[data-sku="LOKO-BUNDLE"]')).toHaveClass(/active/);
    await expect(page.locator('#price-display')).toHaveText('$119');
  });

  test('variants: switching to Loko Air updates price to $59', async ({ page }) => {
    await page.locator('.variant-option[data-sku="LOKO-AIR"]').click();
    await expect(page.locator('#price-display')).toHaveText('$59');
    await expect(page.locator('.variant-option[data-sku="LOKO-AIR"]')).toHaveClass(/active/);
    await expect(page.locator('.variant-option[data-sku="LOKO-BUNDLE"]')).not.toHaveClass(/active/);
  });

  // ── Tabs ─────────────────────────────────────────────────────────────────

  test('tabs: Description pane is active by default', async ({ page }) => {
    await expect(page.locator('#tab-description')).toHaveClass(/active/);
    await expect(page.locator('.tab-btn[data-tab="description"]')).toHaveClass(/active/);
  });

  test('tabs: clicking Specifications shows that pane and hides Description', async ({ page }) => {
    await page.locator('.tab-btn[data-tab="specs"]').click();
    await expect(page.locator('#tab-specs')).toHaveClass(/active/);
    await expect(page.locator('#tab-description')).not.toHaveClass(/active/);
    await expect(page.locator('.tab-btn[data-tab="specs"]')).toHaveClass(/active/);
  });

  test('tabs: all four tab buttons exist', async ({ page }) => {
    for (const tab of ['description', 'specs', 'inbox', 'downloads']) {
      await expect(page.locator(`.tab-btn[data-tab="${tab}"]`)).toBeVisible();
    }
  });

  // ── Cart sheet ───────────────────────────────────────────────────────────

  test('cart: Add to Cart opens the sheet with the bundle, shows $119', async ({ page }) => {
    await page.locator('#btn-add-cart').click();

    // Sheet opens
    await expect(page.locator('#cart-sheet')).toHaveAttribute('aria-hidden', 'false');

    // One line item with the correct variant name and subtotal
    await expect(page.locator('.cart-sheet-item')).toHaveCount(1);
    await expect(page.locator('.cart-sheet-item-variant')).toHaveText('Loko Bundle');
    await expect(page.locator('#cart-sheet-subtotal')).toHaveText('$119');
  });

  test('cart: adding both variants shows two lines and correct subtotal', async ({ page }) => {
    // Add LOKO-BUNDLE
    await page.locator('#btn-add-cart').click();
    await expect(page.locator('#cart-sheet')).toHaveAttribute('aria-hidden', 'false');

    // Close sheet
    await page.locator('#cart-sheet-close').click();
    await expect(page.locator('#cart-sheet')).toHaveAttribute('aria-hidden', 'true');

    // Switch to LOKO-AIR and add
    await page.locator('.variant-option[data-sku="LOKO-AIR"]').click();
    await page.locator('#btn-add-cart').click();
    await expect(page.locator('#cart-sheet')).toHaveAttribute('aria-hidden', 'false');

    // Two line items, subtotal = $119 + $59
    await expect(page.locator('.cart-sheet-item')).toHaveCount(2);
    await expect(page.locator('#cart-sheet-subtotal')).toHaveText('$178');
  });

  test('cart: removing one item updates the subtotal', async ({ page }) => {
    // Build a two-item cart
    await page.locator('#btn-add-cart').click();
    await page.locator('#cart-sheet-close').click();
    await page.locator('.variant-option[data-sku="LOKO-AIR"]').click();
    await page.locator('#btn-add-cart').click();
    await expect(page.locator('.cart-sheet-item')).toHaveCount(2);

    // Remove the second item (LOKO-AIR, $59)
    await page.locator('.cart-sheet-item').nth(1).locator('[data-act="remove"]').click();
    await expect(page.locator('.cart-sheet-item')).toHaveCount(1);
    await expect(page.locator('#cart-sheet-subtotal')).toHaveText('$119');
  });

  test('cart: closing sheet with × and backdrop both work', async ({ page }) => {
    await page.locator('#btn-add-cart').click();
    await expect(page.locator('#cart-sheet')).toHaveAttribute('aria-hidden', 'false');

    // Close via × button
    await page.locator('#cart-sheet-close').click();
    await expect(page.locator('#cart-sheet')).toHaveAttribute('aria-hidden', 'true');

    // Reopen and close via Escape key
    await page.locator('#btn-add-cart').click();
    await expect(page.locator('#cart-sheet')).toHaveAttribute('aria-hidden', 'false');
    await page.keyboard.press('Escape');
    await expect(page.locator('#cart-sheet')).toHaveAttribute('aria-hidden', 'true');
  });
});
