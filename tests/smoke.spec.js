/**
 * Smoke tests — one per language.
 *
 * Verifies that layout.js correctly fetches the header/footer partials,
 * applies data-i18n translations, and rewrites hrefs.  A single bad
 * layout.js push can blank all 720+ pages; these catch that class of bug.
 */

const { test, expect } = require('@playwright/test');

const LANGS = [
  { code: 'en', path: '/',    label: 'EN', shopNav: 'Shop'     },
  { code: 'es', path: '/es/', label: 'ES', shopNav: 'Tienda'   },
  { code: 'fr', path: '/fr/', label: 'FR', shopNav: 'Boutique' },
  { code: 'ja', path: '/ja/', label: 'JA', shopNav: 'ショップ'  },
  { code: 'ru', path: '/ru/', label: 'RU', shopNav: 'Магазин'  },
  { code: 'zh', path: '/zh/', label: 'ZH', shopNav: '商店'     },
];

for (const lang of LANGS) {
  test(`${lang.code}: header and footer inject, lang label and nav translated`, async ({ page }) => {
    await page.goto(lang.path);

    // layout.js fetches partials asynchronously — wait for injection
    await expect(page.locator('header')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('footer')).toBeVisible({ timeout: 5_000 });

    // Language selector button shows the correct 2-letter code
    await expect(page.locator('.current-lang')).toHaveText(lang.label);

    // The "Shop" nav link text is translated via data-i18n
    await expect(page.locator('.nav-link[href*="#shop"]')).toHaveText(lang.shopNav);

    // Logo href is rewritten by applyLangPrefix() for non-English pages
    const logoHref = await page.locator('a.logo').getAttribute('href');
    if (lang.code === 'en') {
      expect(logoHref).toBe('/');
    } else {
      expect(logoHref).toContain(`/${lang.code}/`);
    }
  });
}
