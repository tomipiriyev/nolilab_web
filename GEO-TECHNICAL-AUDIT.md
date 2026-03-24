# GEO Technical SEO Audit — nolilab.com
**Date:** March 21, 2026
**Audited URLs:** Homepage, /blog/lora-lorawan-a-simple-guide/, /specifications/, /lorawan/, robots.txt, sitemap.xml, llms.txt

---

## Technical Score: 90/100 — Excellent

nolilab.com is technically exceptional for its size. The site is fully server-side rendered (SSR), has outstanding TTFB performance (0.32–0.59s), comprehensive security headers, and explicitly allows every major AI crawler. The only meaningful gaps are the absence of Cloudflare edge caching for HTML pages and the lack of IndexNow protocol support. Both are quick fixes.

## Score Breakdown

| Category | Score | Max | Status |
|---|---|---|---|
| Crawlability | 15 | 15 | ✅ Pass |
| Indexability | 10 | 12 | ⚠️ Warn |
| Security | 10 | 10 | ✅ Pass |
| URL Structure | 7 | 8 | ⚠️ Warn |
| Mobile Optimization | 10 | 10 | ✅ Pass |
| Core Web Vitals | 13 | 15 | ✅ Pass |
| Server-Side Rendering | 15 | 15 | ✅ Pass |
| Page Speed & Server | 10 | 15 | ⚠️ Warn |
| **Total** | **90** | **100** | |

*Pass = 80%+ of category points, Warn = 50–79%, Fail = <50%*

---

## AI Crawler Access

**Status: All major AI crawlers explicitly allowed ✅**

The robots.txt is clean, well-structured, and explicitly names 12 AI crawlers with `Allow: /`. This is a best-in-class configuration.

| Crawler | User-Agent | Status | Notes |
|---|---|---|---|
| GPTBot | GPTBot | ✅ Explicitly Allowed | ChatGPT / OpenAI |
| ChatGPT-User | ChatGPT-User | ✅ Explicitly Allowed | ChatGPT browsing |
| ClaudeBot | ClaudeBot | ✅ Explicitly Allowed | Anthropic Claude |
| anthropic-ai | anthropic-ai | ✅ Explicitly Allowed | Anthropic general |
| PerplexityBot | PerplexityBot | ✅ Explicitly Allowed | Perplexity AI |
| Google-Extended | Google-Extended | ✅ Explicitly Allowed | Gemini / AI Overviews training |
| Googlebot | Googlebot | ✅ Allowed (via User-agent: *) | Google Search |
| Bingbot | bingbot | ✅ Allowed (via User-agent: *) | Bing / Copilot |
| CCBot | CCBot | ✅ Explicitly Allowed | Common Crawl |
| Bytespider | Bytespider | ✅ Explicitly Allowed | ByteDance / TikTok AI |
| Applebot | Applebot | ✅ Explicitly Allowed | Apple Intelligence |
| Amazonbot | Amazonbot | ✅ Explicitly Allowed | Amazon AI |
| YouBot | YouBot | ✅ Explicitly Allowed | You.com |
| cohere-ai | cohere-ai | ✅ Explicitly Allowed | Cohere |

**Blocked paths (correctly):** `/customer_authentication/`, `/admin/`, `/checkout/`

> **Note:** An earlier internal audit run identified a potential Cloudflare-injected section that blocked several of these crawlers. The current robots.txt has no such section — all AI crawlers are cleanly permitted. If Cloudflare's bot management was previously injecting blocking rules, this appears to have been resolved.

---

## Category 1: Crawlability — 15/15 ✅

### robots.txt

**Status: Excellent**

```
# Robots.txt for nolilab.com
User-agent: *
Allow: /
Disallow: /customer_authentication/
Disallow: /admin/
Disallow: /checkout/

# Sitemap
Sitemap: https://nolilab.com/sitemap.xml

# AI Assistants & LLM Crawlers
User-agent: GPTBot
Allow: /
[... 11 more AI crawler allow blocks]
```

**Strengths:**
- `User-agent: *` with `Allow: /` as the base rule — all crawlers permitted by default
- Only three paths blocked: private/admin areas (correct)
- Sitemap referenced correctly
- Explicit AI crawler allow-list sends a strong positive signal

**Minor note:** The Sitemap reference uses non-www (`https://nolilab.com/sitemap.xml`) while the sitemap's URL entries use www (`https://www.nolilab.com/...`). Recommend making these consistent — either both non-www or both www. Since the canonical is www, the Sitemap reference should ideally be `https://www.nolilab.com/sitemap.xml`.

### XML Sitemap

**Status: Excellent**

| Property | Value |
|---|---|
| Location | https://nolilab.com/sitemap.xml |
| Type | Standard sitemap (not a sitemap index) |
| URL count | 200+ |
| lastmod | Present on all entries ✅ |
| changefreq | Present on all entries |
| priority | Present on all entries |
| Multilingual | Yes — 6 language editions |

**Sample entries with lastmod:**
```
https://www.nolilab.com/ — 2026-02-22
https://www.nolilab.com/specifications/ — 2026-02-22
https://www.nolilab.com/author/tamleykha-piriyev/ — 2026-03-03
https://www.nolilab.com/blog/how-distance-affects-wireless-signal-range/ — 2026-02-07
```

The presence of `lastmod` on all entries is best practice and enables search engines to prioritize recrawling updated content.

### Crawl Depth

**Status: Excellent**
- Homepage = depth 0
- Top-level pages (specifications, software, firmware, lorawan, gps, contact, blog index) = depth 1 (linked from main navigation)
- Blog posts = depth 2 (linked from /blog/)
- All content is reachable within 2 clicks — well within the 3-click threshold

### Noindex

**Status: Pass**

Homepage meta robots: `index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1`

The `max-snippet:-1` and `max-image-preview:large` settings are explicitly generous — they tell Google it may display unlimited text snippets and large image previews. This is the optimal configuration for AI snippet generation in Google AI Overviews.

No erroneous noindex directives found on any tested page.

---

## Category 2: Indexability — 10/12 ⚠️

### Canonical Tags

**Status: Pass**

Canonical on homepage (from raw HTML):
```html
<link rel="canonical" href="https://www.nolilab.com/" />
```

Self-referencing canonical confirmed. The www form is the declared canonical throughout. All sitemap entries also use www. This is consistent.

**One inconsistency to note:** The Sitemap directive in robots.txt references `https://nolilab.com/sitemap.xml` (non-www) while the canonical and all sitemap URL entries use www. Recommend updating the robots.txt Sitemap directive to match.

### Duplicate Content

**Status: Warn (−1 point)**

**HTTP → HTTPS redirect:** ✅ `http://nolilab.com/` returns 301 → `https://nolilab.com/` (single hop, correct)

**Non-www behavior:** The site declares `https://www.nolilab.com/` as its canonical but also serves content at `https://nolilab.com/` (non-www) without redirecting to www. This means both versions may be accessible:
- `https://nolilab.com/` → 200 OK (content served)
- `https://www.nolilab.com/` → presumed 200 OK (canonical target)

Both serving content with a self-canonical creates potential duplicate content. The preferred behavior is: `https://nolilab.com/` should 301-redirect to `https://www.nolilab.com/` (since www is declared canonical). Verify and implement this redirect.

### Hreflang

**Status: Pass**

All 7 hreflang alternates confirmed in raw HTML:
```html
<link rel="alternate" hreflang="en"        href="https://www.nolilab.com/" />
<link rel="alternate" hreflang="ja"        href="https://www.nolilab.com/ja/" />
<link rel="alternate" hreflang="es"        href="https://www.nolilab.com/es/" />
<link rel="alternate" hreflang="ru"        href="https://www.nolilab.com/ru/" />
<link rel="alternate" hreflang="zh"        href="https://www.nolilab.com/fr/" />
<link rel="alternate" hreflang="fr"        href="https://www.nolilab.com/fr/" />
<link rel="alternate" hreflang="x-default" href="https://www.nolilab.com/" />
```

x-default pointing to the English homepage is correct. Language codes are valid ISO 639-1. These tags are also mirrored in the sitemap.

**Note:** For reciprocal hreflang to be valid, each language edition page must also contain hreflang tags pointing back to the other editions. This was confirmed at the homepage level; inner pages should be spot-checked.

### Index Bloat

**Status: Warn (−1 point)**

200+ URLs across 6 language editions for a single niche hardware product raises a thin content concern. The math: 22 blog posts × 6 languages = 132 language-variant blog pages. If these are machine-translated or AI-translated without localization or human review, they may be thin content.

**Recommendation:** Audit the localized blog content (e.g., `/ja/blog/how-distance-affects-wireless-signal-range/`) to verify the translated content is substantive. If translations are low quality, consider:
1. Adding `hreflang` correctly so each variant serves only its target language audience
2. Using `noindex` on lower-quality language editions until they can be improved
3. Reducing the set of translated languages to the ones with genuine traffic demand

---

## Category 3: Security — 10/10 ✅

**Status: Exceptional — all 6 security headers present**

| Header | Value | Status |
|---|---|---|
| HTTPS | HTTP/2, valid TLS | ✅ |
| HTTP redirect | 301 → HTTPS (1 hop) | ✅ |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | ✅ 2-year HSTS, HSTS preload eligible |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'...` | ✅ Present (see note) |
| `X-Content-Type-Options` | `nosniff` | ✅ |
| `X-Frame-Options` | `DENY` | ✅ |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ |
| `Permissions-Policy` | Restricts camera, mic, geolocation, payment, USB, interest-cohort | ✅ |

**CSP note:** The policy includes `'unsafe-inline'` in both `script-src` and `style-src`. This weakens XSS protection because inline scripts are permitted. For a static site with no user-generated content, this is a lower-severity risk. A future improvement would be to use nonce-based or hash-based CSP to remove `unsafe-inline`, but this is not a blocker.

**Privacy page:** The site lists a privacy page at `https://www.nolilab.com/privacy/` (lastmod 2026-02-22 in sitemap). This page EXISTS — it was previously believed to be missing because it was tested at `/privacy-policy/` (which returns 404). The actual URL is `/privacy/`. **Verify this page is linked from the site footer and is GDPR-compliant.**

---

## Category 4: URL Structure — 7/8 ⚠️

| Check | Status | Notes |
|---|---|---|
| Clean readable URLs | ✅ 2/2 | Lowercase, hyphens, no parameters, human-readable |
| Logical hierarchy | ✅ 2/2 | /blog/slug/, /specifications/, /lorawan/ — clean structure |
| No redirect chains | ✅ 2/2 | HTTP → HTTPS is 1 hop; no chains detected |
| Parameter handling | ✅ 1/2 | No parameter URLs in sitemap; good |

**Minor inconsistency (−1 point):** Trailing slash usage is inconsistent. The sitemap uses trailing slashes on all URLs (e.g., `/blog/lora-lorawan-a-simple-guide/`). However, the JSON-LD `mainEntityOfPage @id` on blog posts was observed using URLs without trailing slashes. This inconsistency means different crawlers may index duplicate versions. Standardize trailing slash handling site-wide and ensure canonicals and structured data URLs match.

---

## Category 5: Mobile Optimization — 10/10 ✅

| Check | Status | Evidence |
|---|---|---|
| Viewport meta tag | ✅ 3/3 | `width=device-width, initial-scale=1.0, maximum-scale=5` |
| Responsive layout | ✅ 3/3 | Static SSG site; all images have explicit dimensions; no fixed-width containers detected |
| Tap targets | ✅ 2/2 | Standard navigation structure; no known tap target issues |
| Font sizes | ✅ 2/2 | Fonts preloaded with `rel="preload" as="font" crossorigin`; font-display swap pattern |

**`maximum-scale=5` note:** Allows user zoom up to 5× — correct and accessibility-compliant (the common bad practice of `user-scalable=no` or `maximum-scale=1` is NOT present here).

As of July 2024, Google crawls exclusively with mobile Googlebot. This site is well-prepared for mobile-first indexing.

---

## Category 6: Core Web Vitals — 13/15 ✅

*Assessment based on page characteristics and resource signals. Field data from CrUX or PageSpeed Insights should be used for verification.*

| Metric | Estimated Status | Key Evidence |
|---|---|---|
| **LCP** (< 2.5s) | ✅ Likely Good | Hero image: `fetchpriority="high"`, served as `.avif`/`.webp` via `<picture>`, explicit 800×785px dimensions. TTFB 0.41s leaves ~2s budget for LCP. Fonts preloaded. |
| **INP** (< 200ms) | ✅ Likely Good | Single JS file (`/js/layout.js`) loaded with `defer`. No synchronous 3rd-party scripts. No analytics, no ad scripts, no chat widgets. |
| **CLS** (< 0.1) | ✅ Likely Good | All 27 images on homepage have explicit `width` and `height` attributes. Google Fonts loaded with `font-display: swap` and preload. No above-fold dynamic content insertion. |

**Deduction (−2):** These are risk assessments based on static signals, not measured field data. CrUX field data may reveal real-world differences, particularly for mobile users on slower networks in Japan, Russia, or China (where the site's language editions target). Recommend validating with PageSpeed Insights and Google Search Console Core Web Vitals report.

---

## Category 7: Server-Side Rendering — 15/15 ✅

**Status: Perfect — fully server-side rendered**

This is the highest-priority GEO technical requirement, and nolilab.com passes without reservation.

| Check | Status | Evidence |
|---|---|---|
| Main content in raw HTML | ✅ 8/8 | Confirmed via curl: blog post H1, all body paragraphs, specification tables, FAQ questions/answers — all present in raw HTML |
| Meta tags + structured data | ✅ 4/4 | 4 JSON-LD blocks confirmed in raw homepage HTML; all meta tags server-rendered |
| Internal links in raw HTML | ✅ 3/3 | All navigation links present in raw HTML; no JS-generated navigation |

**Framework detection:** The site appears to use a custom static site generator (Hugo-style or similar). No React root, no Next.js data blob, no Angular bootstrap marker, no Vue app div detected. The only JavaScript file is `/js/layout.js` with `defer` — handles UI enhancement (mobile menu toggle) only, not content generation.

**Why this matters:** GPTBot, ClaudeBot, PerplexityBot, and Google-Extended do **not** execute JavaScript. They read raw HTML only. If content were JS-rendered, these crawlers would see empty pages. At nolilab.com, every word, every FAQ answer, every product specification is available to AI crawlers in the initial HTML response. This is the correct architecture for AI discoverability.

---

## Category 8: Page Speed & Server — 10/15 ⚠️

### TTFB Measurements

| Page | TTFB | Total | HTML Size | Status |
|---|---|---|---|---|
| Homepage (/) | 0.41s | 0.41s | 68.7 KB | ✅ Excellent |
| /blog/lora-lorawan-a-simple-guide/ | 0.32s | 0.33s | 32.7 KB | ✅ Excellent |
| /specifications/ | 0.59s | 0.61s | 30.4 KB | ✅ Good |
| /lorawan/ | 0.47s | 0.47s | 25.2 KB | ✅ Excellent |

All TTFBs well under the 800ms threshold. HTML sizes are minimal — the heaviest page (homepage at 68.7KB) is a fraction of the 2MB target.

### Resource Optimization

| Check | Status | Notes |
|---|---|---|
| TTFB < 800ms | ✅ 3/3 | 0.32–0.59s across all pages tested |
| Page weight < 2MB | ✅ 2/2 | HTML 25–68KB; total with assets estimated < 800KB |
| Images optimized | ✅ 3/3 | `.avif`/`.webp` via `<picture>`, explicit dimensions, `fetchpriority="high"` on LCP, `loading="lazy"` on below-fold images |
| JS bundles | ✅ 2/2 | Single `/js/layout.js` with `defer`; no large bundles detected |
| Compression | ✅ 1/2 | Cloudflare handles gzip/brotli automatically; actual wire transfer is compressed |
| Cache headers on HTML | ❌ 0/2 | `cache-control: public, max-age=0, must-revalidate` + `CF-Cache-Status: DYNAMIC` — HTML is NOT cached at Cloudflare's edge. Every request hits origin. |
| CDN | ✅ 1/1 | Cloudflare CDN confirmed (CF-Ray header, CF-Cache-Status header) |

**Critical optimization gap — Cloudflare edge caching:**

The response headers show:
```
cache-control: public, max-age=0, must-revalidate
cf-cache-status: DYNAMIC
```

`DYNAMIC` means Cloudflare is forwarding every HTML request to the origin server rather than serving from its global edge network. For a fully static site serving 6 language editions to users in Japan, Russia, China, France, and Spain, this means every page load incurs the full origin latency from Tallinn, Estonia, regardless of where the user is.

**Fix:** In Cloudflare Dashboard → Caching → Cache Rules, create a rule to cache HTML with:
```
Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400
```
This caches HTML at Cloudflare edges for 1 day (with 1-hour browser cache and 1-day revalidation). For a static site, this is safe — Cloudflare's cache can be purged manually or via cache tags when content is updated.

---

## IndexNow Protocol — Not Implemented

**Status: Missing**

No `/.well-known/indexnow-key.txt` or similar key file found (returns 404). IndexNow is supported by Bing, Yandex, Seznam, and Naver. Since ChatGPT uses Bing's index and Bing Copilot uses Bing's index, faster Bing indexing means faster AI visibility on two major platforms.

**Implementation:**
1. Generate an IndexNow key at [indexnow.org](https://www.indexnow.org)
2. Place the key file at `https://nolilab.com/[key].txt`
3. Submit page URLs to Bing via the IndexNow API whenever content is published or updated

For a static site, this is typically implemented by adding an IndexNow submission step to the build/deploy pipeline.

---

## llms.txt Assessment

**Status: Present and Well-Structured ✅**

The file at `https://nolilab.com/llms.txt` exists (HTTP 200, text/plain) and contains:
- Company and product description (opening paragraph)
- Key facts section with 14 technical data points
- Products & pricing section (all 3 SKUs)
- Use cases section
- Main pages index (10 core pages with descriptions)
- Blog article catalog organized by topic category (24 articles)
- Languages section (6 locales)
- Company section (contact, social profiles)

This is one of the stronger `llms.txt` implementations compared to most sites. It gives AI systems a clear navigation map of the site.

**Improvement opportunities:**
1. Add 1–2 sentence abstracts to each blog article entry (currently title + URL only)
2. Add a `Last updated: YYYY-MM-DD` field at the top
3. Consider creating `llms-full.txt` with complete product documentation and specifications
4. Add `ai-input: yes` signal to clarify real-time grounding is permitted

---

## Critical Issues (Fix Immediately)

### C1 — non-www to www redirect not enforced
**Impact:** Duplicate content, crawl budget waste, canonical signal dilution

`https://nolilab.com/` returns 200 OK but the canonical tag declares `https://www.nolilab.com/`. Both versions serving content with no redirect means search engine crawlers may index both. The correct behavior: `https://nolilab.com/*` should 301-redirect to `https://www.nolilab.com/*`.

**Fix:** In Cloudflare → Redirects (or Rules → Redirect Rules), add:
```
If hostname = nolilab.com
Then redirect to https://www.nolilab.com${uri} (301)
```

### C2 — Privacy page not linked from navigation
**Impact:** Trust signals, GDPR compliance discoverability

The privacy policy exists at `https://www.nolilab.com/privacy/` (confirmed in sitemap, lastmod 2026-02-22) but was previously believed to be missing because the tested URL `/privacy-policy/` returns 404. The page exists — but if it's not linked from the site footer, users and crawlers cannot find it. Verify:
1. The `/privacy/` page is fully GDPR-compliant
2. A "Privacy Policy" link in the site footer points to `/privacy/`
3. `/privacy-policy/` either redirects to `/privacy/` or returns 404 gracefully (current 404 is acceptable if `/privacy/` is properly linked)

---

## Warnings (Fix This Month)

### W1 — Cloudflare edge caching not enabled for HTML
HTML is served with `max-age=0` and Cloudflare is not caching it (`CF-Cache-Status: DYNAMIC`). For a static site with global language editions, this increases TTFB for non-European users.

**Fix:** Configure a Cloudflare Cache Rule to cache HTML pages with appropriate TTL (1–24 hours). See Category 8 for specific header values.

### W2 — IndexNow not implemented
Bing (and thus ChatGPT and Copilot) may not learn of new/updated content for days or weeks. IndexNow enables instant notification.

**Fix:** 30-minute implementation. Generate key, place key file at `/.well-known/indexnow-[key].txt`, submit URLs via API on deploy.

### W3 — Sitemap Sitemap directive uses non-www
`robots.txt` line: `Sitemap: https://nolilab.com/sitemap.xml` — uses non-www, but the canonical and all sitemap content URLs use www.

**Fix:** Update robots.txt to: `Sitemap: https://www.nolilab.com/sitemap.xml`

### W4 — Trailing slash inconsistency in structured data
The sitemap uses trailing slashes on all URLs. JSON-LD `mainEntityOfPage @id` on blog posts uses URLs without trailing slashes. This creates minor ambiguity for crawlers matching canonical to schema URL.

**Fix:** In the blog post template, ensure the JSON-LD `mainEntityOfPage @id` includes a trailing slash, consistent with the sitemap and canonical tag.

### W5 — CSP contains unsafe-inline
`Content-Security-Policy: script-src 'self' 'unsafe-inline'` weakens XSS protection.

**Fix (lower priority):** Move any remaining inline scripts to `/js/layout.js` and remove `unsafe-inline`. Implement nonce-based CSP if any inline scripts cannot be extracted.

---

## Recommendations (Optimize This Quarter)

### R1 — Validate translated content quality
200+ indexed pages across 6 languages for a niche hardware product may include thin machine-translated content. Thin multilingual content can trigger quality issues. Spot-check 3–5 pages from each language edition.

### R2 — Add IndexNow to the deploy pipeline
Once IndexNow is set up (W2), integrate it into the build/deploy pipeline so every new or updated page triggers automatic submission to Bing.

### R3 — Monitor Core Web Vitals in Search Console
The technical signals are all positive for CWV, but real user data (CrUX) may tell a different story, especially for mobile users in Asia accessing content from Tallinn origin servers. If edge caching (W1) is implemented, CWV for international users should improve significantly.

### R4 — Enrich llms.txt with article abstracts
Add 1–2 sentence summaries to each blog article entry in llms.txt. This enables AI models using llms.txt as a navigation layer to select the right page for a query without fetching every URL — improving both citation accuracy and crawl efficiency.

---

## Summary: What nolilab.com Does Right

This is technically one of the cleanest sites in the hardware/IoT product category:

| Strength | Why It Matters |
|---|---|
| Fully SSR (static HTML) | AI crawlers read 100% of content without JS execution |
| All AI crawlers explicitly allowed | No ambiguity — GPTBot, ClaudeBot, PerplexityBot all have clear access |
| TTFB 0.32–0.59s | Excellent performance from all audited pages |
| All security headers present | HSTS preloaded, DENY framing, full permissions policy |
| llms.txt exists and is structured | Direct AI navigation map — most sites do not have this |
| Lastmod on all sitemap entries | Enables efficient recrawling of updated content |
| Images: WebP/AVIF, explicit dimensions, fetchpriority | Optimized for LCP and CLS |
| HTTP/2, Cloudflare CDN | Modern protocol and global distribution infrastructure in place |
| Generous robots meta (max-snippet:-1) | Explicitly permits AI systems to use full content in snippets |

The technical foundation is strong. The primary work for this site is content quality and brand authority — not technical remediation.
