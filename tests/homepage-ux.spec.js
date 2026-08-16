/**
 * Homepage UX tests — use-case tabs, image loading, footer groups, mobile hero.
 *
 * The tabs replaced six stacked full-width sections that measured 5,072px on
 * desktop. The thing most worth protecting here is that all six panels still
 * ship in the HTML: this page is the site's main SEO/GEO asset, and a
 * regression to JS-built panels would delete five use cases from the view of
 * every non-JS AI crawler without any visible symptom.
 */

const { test, expect } = require('@playwright/test');

const LANGS = ['/', '/es/', '/fr/', '/ja/', '/ru/', '/zh/'];
const SLUGS = ['pets', 'research', 'drones', 'agriculture', 'tactical', 'outdoor'];

test.describe('use-case tabs', () => {
  for (const path of LANGS) {
    test(`${path} ships all six panels and shows exactly one`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('.use-case-panel')).toHaveCount(6);
      await expect(page.locator('.use-case-tab')).toHaveCount(6);
      await expect(page.locator('.use-case-panel:visible')).toHaveCount(1);
      await expect(page.locator('#uc-panel-pets')).toBeVisible();

      // Tab labels come from each file's own translated category pill, so none
      // of them may fall back to the English string on a translated page.
      const labels = await page.locator('.use-case-tab').allTextContents();
      expect(labels.every((l) => l.trim().length > 0)).toBe(true);
      if (path !== '/') {
        expect(labels.join('|')).not.toContain('Pet Safety');
      }
    });
  }

  test('clicking a tab swaps the panel and updates aria state', async ({ page }) => {
    await page.goto('/');
    await page.locator('#uc-tab-drones').click();

    await expect(page.locator('#uc-panel-drones')).toBeVisible();
    await expect(page.locator('#uc-panel-pets')).toBeHidden();
    await expect(page.locator('#uc-tab-drones')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#uc-tab-pets')).toHaveAttribute('aria-selected', 'false');
    await expect(page.locator('.use-case-panel:visible')).toHaveCount(1);
  });

  test('arrow keys move between tabs, Home and End jump to the ends', async ({ page }) => {
    await page.goto('/');
    await page.locator('#uc-tab-pets').focus();

    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#uc-tab-research')).toBeFocused();
    await expect(page.locator('#uc-panel-research')).toBeVisible();

    await page.keyboard.press('End');
    await expect(page.locator('#uc-tab-outdoor')).toBeFocused();
    await expect(page.locator('#uc-panel-outdoor')).toBeVisible();

    // wraps forward off the end
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#uc-tab-pets')).toBeFocused();

    await page.keyboard.press('Home');
    await expect(page.locator('#uc-tab-pets')).toBeFocused();
  });

  test('only the selected tab is in the tab order', async ({ page }) => {
    await page.goto('/');
    await page.locator('#uc-tab-agriculture').click();
    for (const slug of SLUGS) {
      await expect(page.locator(`#uc-tab-${slug}`)).toHaveAttribute(
        'tabindex', slug === 'agriculture' ? '0' : '-1');
    }
  });

  test('#uc-<slug> deep links open that panel', async ({ page }) => {
    await page.goto('/#uc-tactical');
    await expect(page.locator('#uc-panel-tactical')).toBeVisible();
    await expect(page.locator('#uc-tab-tactical')).toHaveAttribute('aria-selected', 'true');
  });

  test('an unknown hash falls back to the first panel', async ({ page }) => {
    await page.goto('/#uc-nonsense');
    await expect(page.locator('#uc-panel-pets')).toBeVisible();
    await expect(page.locator('.use-case-panel:visible')).toHaveCount(1);
  });

  test('with JS disabled all six panels render as a stack', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('.use-case-panel:visible')).toHaveCount(6);
    // a tab strip nothing can operate must not be shown
    await expect(page.locator('.use-case-tabs')).toBeHidden();
    await context.close();
  });
});

test.describe('image loading', () => {
  test('the first panel loads eagerly, the rest lazily', async ({ page }) => {
    await page.goto('/');
    const first = page.locator('#uc-panel-pets img');
    await expect(first).not.toHaveAttribute('loading', 'lazy');
    await expect(first).toHaveAttribute('fetchpriority', 'high');
    await expect(page.locator('#uc-panel-drones img')).toHaveAttribute('loading', 'lazy');
  });

  test('every use-case image has a blur-up placeholder behind it', async ({ page }) => {
    await page.goto('/');
    const pictures = page.locator('.use-case-image picture');
    await expect(pictures).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      const bg = await pictures.nth(i).evaluate((el) => getComputedStyle(el).backgroundImage);
      expect(bg).toContain('data:image/jpeg;base64');
    }
  });

  // Every one of these was declared 500x400 before, a ratio matching only
  // military-training, so the reserved box was the wrong shape for five of six.
  test('declared dimensions match each file\'s real aspect ratio', async ({ page }) => {
    await page.goto('/');
    const mismatches = [];

    for (const slug of SLUGS) {
      // A lazy image inside a hidden panel never decodes, so naturalWidth
      // stays 0 until its tab is opened.
      await page.locator(`#uc-tab-${slug}`).click();
      const img = page.locator(`#uc-panel-${slug} .use-case-image img`);
      await expect(img).toHaveClass(/is-loaded/);

      const result = await img.evaluate((el) => ({
        src: el.getAttribute('src'),
        declared: Number(el.getAttribute('width')) / Number(el.getAttribute('height')),
        real: el.naturalWidth / el.naturalHeight,
      }));
      if (Math.abs(result.declared - result.real) > 0.01) mismatches.push(result);
    }

    expect(mismatches).toEqual([]);
  });

  test('feature icons are not deferred', async ({ page }) => {
    await page.goto('/');
    const lazy = await page.locator('.feature-icon img[loading="lazy"]').count();
    expect(lazy).toBe(0);
  });

  test('skeletons are dropped once an image decodes, so nothing is letterboxed', async ({ page }) => {
    await page.goto('/');
    await page.locator('.plan-image').first().scrollIntoViewIfNeeded();
    await expect(page.locator('.plan-image').first()).toHaveClass(/is-loaded/);
  });
});

test.describe('footer', () => {
  test('all 44 links survive the regrouping', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('.footer-link')).toHaveCount(44);
    await expect(page.locator('.footer-group')).toHaveCount(4);
  });

  test('the long tail is collapsed but present, and the toggle opens it', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toBeVisible({ timeout: 5_000 });

    await expect(page.locator('.footer-more-links .footer-link')).toHaveCount(24);
    await expect(page.locator('.footer-more-links .footer-link').first()).toBeHidden();

    await page.locator('.footer-more > summary').click();
    await expect(page.locator('.footer-more-links .footer-link').first()).toBeVisible();
  });

  test('group headings translate', async ({ page }) => {
    await page.goto('/es/');
    await expect(page.locator('footer')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('#footer-group-usecase')).toHaveText('Por uso');
    await expect(page.locator('#footer-group-compare')).toHaveText('Comparativas');
  });

  test('grouped links still get the language prefix', async ({ page }) => {
    await page.goto('/ru/');
    await expect(page.locator('footer')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('.footer-group a[href="/ru/hunting-dogs/"]')).toHaveCount(1);
  });

  test('the crawler-only nav fallback is in the DOM but never painted', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('.nav-fallback')).toHaveCount(1);
    await expect(page.locator('.nav-fallback')).toBeHidden();
    await context.close();
  });
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the CTA and trust badges sit above the fold', async ({ page }) => {
    await page.goto('/');
    const bottom = (sel) => page.locator(sel).evaluate(
      (el) => el.getBoundingClientRect().bottom + window.scrollY);

    expect(await bottom('.hero-cta')).toBeLessThan(844);
    expect(await bottom('.hero-features')).toBeLessThan(844);
  });

  test('the page never scrolls horizontally', async ({ page }) => {
    for (const width of [430, 390, 375, 360, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `horizontal overflow at ${width}px`).toBe(0);
    }
  });

  test('comparison tables scroll inside their wrapper, not the page', async ({ page }) => {
    await page.goto('/');
    const wrappers = page.locator('.table-wrapper');
    await expect(wrappers).toHaveCount(2);
    for (let i = 0; i < 2; i++) {
      const scrollable = await wrappers.nth(i).evaluate(
        (el) => el.scrollWidth > el.clientWidth);
      expect(scrollable).toBe(true);
    }
  });

  test('pricing cards stack into one column', async ({ page }) => {
    await page.goto('/');
    const cols = await page.locator('.pricing-grid').evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(cols).toBe(1);
  });

  test('the hamburger opens and closes the menu', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible({ timeout: 5_000 });
    const toggle = page.locator('.mobile-menu-toggle');
    await expect(toggle).toBeVisible();

    await toggle.click();
    await expect(page.locator('.nav-links')).toHaveClass(/active/);
    await expect(page.locator('.nav-link').first()).toBeInViewport();

    await toggle.click();
    await expect(page.locator('.nav-links')).not.toHaveClass(/active/);
  });
});

test('the Loko battery cell is no longer swallowed by a malformed tag', async ({ page }) => {
  await page.goto('/');
  const row = page.locator('#comparison tbody tr', { hasText: 'Battery' });
  await expect(row.locator('td').nth(1)).toHaveText(/1 year/);
});
