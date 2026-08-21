/**
 * Homepage UX tests — the use-case grid, image loading, footer groups, mobile hero.
 *
 * The six use cases render as a card grid: all of them on the page at once,
 * image over content, two columns on desktop and one on mobile. The thing most
 * worth protecting here is that all six ship in the HTML and are visible
 * without JS — this page is the site's main SEO/GEO asset, and a regression to
 * JS-revealed cards would delete five use cases from the view of every non-JS
 * AI crawler without any visible symptom.
 */

const { test, expect } = require('@playwright/test');

const LANGS = ['/', '/es/', '/fr/', '/ja/', '/ru/', '/zh/'];
const SLUGS = ['pets', 'research', 'drones', 'agriculture', 'tactical', 'outdoor'];

test.describe('use-case grid', () => {
  for (const path of LANGS) {
    test(`${path} shows all six use cases`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('.use-case-item')).toHaveCount(6);
      await expect(page.locator('.use-case-item:visible')).toHaveCount(6);
      await expect(page.locator('.use-case-tab')).toHaveCount(0);

      // Each card keeps its own translated category pill.
      const labels = await page.locator('.use-case-category').allTextContents();
      expect(labels).toHaveLength(6);
      expect(labels.every((l) => l.trim().length > 0)).toBe(true);
      if (path !== '/') {
        expect(labels.join('|')).not.toContain('Pet Safety');
      }
    });
  }

  test('the cards lay out two per row on desktop, one on mobile', async ({ page }) => {
    await page.goto('/');
    const columns = () => page.locator('.use-case-grid').evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);

    await page.setViewportSize({ width: 1440, height: 900 });
    expect(await columns()).toBe(2);

    await page.setViewportSize({ width: 390, height: 844 });
    expect(await columns()).toBe(1);
  });

  test('#uc-<slug> deep links still resolve, now natively', async ({ page }) => {
    await page.goto('/#uc-tactical');
    const card = page.locator('#uc-tactical');
    await expect(card).toBeVisible();
    await expect(card).toBeInViewport();
  });

  test('with JS disabled all six cards still render', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('.use-case-item:visible')).toHaveCount(6);
    await context.close();
  });
});

test.describe('image loading', () => {
  // No use-case card is above the fold, so none of them may claim hero
  // priority or load ahead of the images a visitor can actually see. Asserted
  // against the served HTML, because the warm-up in home.js flips the
  // attribute to eager once the page has loaded.
  test('every use-case image ships lazily', async ({ page, request }) => {
    const html = await (await request.get('/')).text();
    const section = html.slice(html.indexOf('class="use-case-grid"'), html.indexOf('</section>', html.indexOf('use-case-grid')));
    expect(section.match(/loading="lazy"/g)).toHaveLength(6);
    expect(section).not.toContain('fetchpriority');
  });

  // A lazy image that never enters the viewport keeps showing its 20px
  // placeholder — a blurred photo, which is what full-page screenshot captures
  // record. home.js promotes the stragglers once the page is idle.
  test('placeholders resolve on their own without any scrolling', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    const decoded = () => page.evaluate(() =>
      [...document.querySelectorAll('.use-case-image img')].filter((el) => el.complete && el.naturalWidth).length);

    await expect.poll(decoded, { timeout: 10_000 }).toBe(6);

    // ...and the warm-up must not race the initial render: nothing below the
    // fold may be fetched before the load event.
    const early = await page.evaluate(() => {
      const load = performance.timing.loadEventStart - performance.timing.navigationStart;
      return performance.getEntriesByType('resource')
        .filter((r) => /military-training|hiking-adventure/.test(r.name) && r.startTime < load).length;
    });
    expect(early).toBe(0);
  });

  /* Three of these AVIFs were 12-tile grid images that Chromium decoded to a
     fully transparent bitmap. Every load-based signal said healthy — 200
     response, correct naturalWidth, load fired, img.decode() resolved — while
     the visitor saw the LQIP through an empty <img>, i.e. a photo that looked
     permanently blurred. Safari rendered them fine. Only painting the pixels
     catches it, so paint them. */
  test('every use-case image actually paints pixels in this browser', async ({ page }) => {
    await page.goto('/');
    const blank = await page.evaluate(async () => {
      const out = [];
      for (const img of document.querySelectorAll('.use-case-image img')) {
        for (const url of [...img.closest('picture').querySelectorAll('source')].map((s) => s.srcset)) {
          const probe = new Image();
          probe.src = url;
          try { await probe.decode(); } catch { out.push(url + ' (decode threw)'); continue; }

          const c = document.createElement('canvas');
          c.width = 60; c.height = 40;
          const ctx = c.getContext('2d');
          ctx.drawImage(probe, 0, 0, 60, 40);
          const d = ctx.getImageData(0, 0, 60, 40).data;
          let sum = 0, sum2 = 0, n = 0;
          for (let i = 0; i < d.length; i += 4) { sum += d[i]; sum2 += d[i] * d[i]; n++; }
          const sd = Math.sqrt(sum2 / n - (sum / n) ** 2);
          if (sd < 2) out.push(`${url} (flat, stddev ${sd.toFixed(1)})`);
        }
      }
      return out;
    });
    expect(blank).toEqual([]);
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
      // A lazy image only decodes once it is near the viewport, so scroll to
      // each card before reading naturalWidth.
      const img = page.locator(`#uc-${slug} .use-case-image img`);
      await img.scrollIntoViewIfNeeded();
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

  // The fallback is clipped rather than display:none, so Playwright still
  // calls it "visible" — what matters is that it occupies no perceivable area
  // while keeping every anchor in the DOM for non-JS crawlers.
  test('the crawler-only nav fallback keeps its links but takes up no space', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');

    const nav = page.locator('.nav-fallback');
    await expect(nav).toHaveCount(1);
    await expect(nav.locator('a')).toHaveCount(48);

    const box = await nav.boundingBox();
    expect(box.width).toBeLessThanOrEqual(1);
    expect(box.height).toBeLessThanOrEqual(1);

    // and it must not push the page around
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);

    await context.close();
  });

  test('layout.js removes the fallback once the real footer lands', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('.nav-fallback')).toHaveCount(0);
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
