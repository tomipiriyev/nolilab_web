---
title: NoliLab / Loko GPS Tracker — GEO Analysis
date: 2026-08-09
url: https://www.nolilab.com/
auditor: Agentic SEO Engineer skill (learned-skill-seo-engineer)
---

# GEO Analysis — nolilab.com

## 1. GEO Readiness Score: 62/100

| Dimension | Score | Status |
|-----------|-------|--------|
| Citability | 14/25 | ⚠️ Solid definitions, weak entity |
| Structural Readability | 14/20 | ✅ Good hierarchy, needs tightening |
| Multi-Modal Content | 4/15 | ⚠️ Images present, no video/charts |
| Authority & Brand Signals | 13/20 | ✅ Press + Wikidata, no Wikipedia |
| Technical Accessibility | 18/20 | ✅ Near-perfect |

---

## 2. Platform Breakdown

| Platform | Citability Estimate | Key Finding |
|----------|---------------------|-------------|
| **Google AI Overviews** | ~60% | Schema + lls.txt help; Wikipedia gap hurts |
| **ChatGPT Web Search** | ~55% | Wikidata present (strong signal); no YouTube |
| **Perplexity AI** | ~50% | No Reddit presence; has Wikidata + press |
| **Bing Copilot** | ~65% | Traditional SEO foundation is strong |

Only ~11% of domains appear in both ChatGPT and Google AI Overviews for the same query — platform-specific gaps compound.

---

## 3. AI Crawler Access Status

### robots.txt analysis (CONFIRMED)

All major AI/LLM crawlers are **explicitly allowed**:

| Crawler | Status | Note |
|---------|--------|------|
| GPTBot (OpenAI) | ✅ Allowed | ChatGPT web search |
| OAI-SearchBot (OpenAI) | Not mentioned | Implied allow via `Allow: /` wildcard |
| ChatGPT-User (OpenAI) | ✅ Allowed | Real-time browsing |
| ClaudeBot (Anthropic) | ✅ Allowed | Claude web features |
| anthropic-ai | ✅ Allowed | Training |
| PerplexityBot | ✅ Allowed | Perplexity AI search |
| Google-Extended | ✅ Allowed | Gemini training |
| CCBot | ✅ Allowed | Open dataset |
| Bytespider | ✅ Allowed | TikTok/Douyin AI |
| YouBot | ✅ Allowed | Yandex You search |
| cohere-ai | ✅ Allowed | Cohere models |
| Applebot | ✅ Allowed | Siri voice |
| Amazonbot | ✅ Allowed | Alexa shopping |

**Verdict:** Excellent. Comprehensive AI crawler allowance. Most competitors block CCBot/training bots entirely.

---

## 4. llms.txt Status (CONFIRMED PRESENT)

File: `/llms.txt` — **EXISTS** ✅

### Quality Assessment

**Strengths:**
- Structured overview section with clear product description
- "Key Facts" bullet list with concrete numbers (size, weight, battery, GNSS, frequency) — highly citable
- Products & Pricing section — direct pricing data AI systems extract easily
- Use Cases enumeration
- Complete Main Pages inventory with descriptions
- Full Blog Articles index organized by topic cluster
- Languages section (i18n awareness)
- Press Coverage section linking to authoritative third-party sources
- Company information with entity details

**Issues:**
| Issue | Severity | Fix |
|-------|----------|-----|
| URLs use naked domain `nolilab.com` instead of `www.nolilab.com` | Medium | Change all URLs to canonical `https://www.nolilab.com/...` |
| Missing RSL 1.0 license declaration | Low | Add machine-readable licensing terms |
| No contact email listed in llms.txt body (only in company section) | Low | Move email to top-level contact line |

---

## 5. Brand Mention Analysis

### Entity Presence

| Signal | Status | Details |
|--------|--------|---------|
| **Wikidata QID** | ✅ Present | Q138751022 — label "Nolilab", aliases "Loko GPS Tracker", P31=company, P2002=Twitter: noli_lab |
| **Wikipedia article** | ❌ Absent | Major citability gap |
| **YouTube channel** | ⚠️ Listed in sameAs | youtube.com/@nolilab_loko_gps — verify active content |
| **Reddit presence** | ❌ Not detected | No branded subreddit or active r/LokoGPS threads |
| **LinkedIn** | ✅ Present | linkedin.com/company/nolilab |
| **GitHub** | ✅ Present | github.com/nolilab (open-source firmware) |
| **Press mentions** | ✅ Strong | Hackaday ×2, SeeedStudio, Electromaker.io, WildLabs, Hackster.io, Antratek, CrowdSupply |

### sameAs Verification

Homepage and Contact page both have **15 sameAs URLs** in Organization schema, matching the press/entity footprint. Author page has LinkedIn + GitHub plus personal LinkedIn.

---

## 6. Passage-Level Citability

### Homepage FAQ Section (POTENTIAL)

The homepage contains an extensive FAQPage schema with 11 Q&A pairs. Each acceptedAnswer paragraph runs approximately 50–65 words.

**Optimal passage length for AI citation: 134–167 words.** Current FAQ answers are shorter than the ideal citability sweet spot. However, each answer IS self-contained, starts with a direct definition ("Loko is...", "Loko operates with..."), uses plain language, and contains specific data points (numbers, tech names). This makes them HIGHLY quotable even if under the target word count.

### Blog Post Passages (MIXED)

Example audit: `blog/lora-lorawan-a-simple-guide/index.html`
- Headings: Clean H2 → H3 hierarchy ✅
- Paragraph structure: Many 2–3 sentence paragraphs ✅
- Some long paragraphs (4+ sentences) — split for citability ⚠️
- No explicit question-based H2 headings (except FAQPage section) ⚠️
- Tables: Yes (Spreading Factor comparisons) ✅
- Lists: Ordered and unordered used appropriately ✅

### Missing Elements

| Element | Status | Impact |
|---------|--------|--------|
| speakable CSS selectors | ❌ Not found | AI systems can't identify best answer blocks |
| Definition pattern blocks | ⚠️ Partial | FAQPage provides them but no inline `.answer-block` class |
| "What is [X]?" as first H2 | ❌ Rare | Only in FAQPage section |
| Statistics with source attribution | ⚠️ Partial | Specs listed but no "according to..." citations |

---

## 7. Server-Side Rendering Check

**VERIFIED: Pure static HTML/CSS/JS, zero JavaScript framework dependencies** ✅

- No React/Vue/Angular
- No client-side routing
- No JavaScript-injected critical content
- All schema markup in initial `<head>`
- All meta tags server-rendered
- JS is deferred (`defer` attribute) and non-critical

This is optimal for AI crawlers which do not execute JavaScript.

---

## 8. Schema Markup Audit (for AI Discoverability)

| Schema Type | Pages | Citability Impact |
|-------------|-------|-------------------|
| Organization + sameAs | Homepage, Contact | HIGH — entity disambiguation |
| Product (AggregateOffer) | Homepage | HIGH — price/availability extraction |
| FAQPage | Homepage, 12+ SEO pages | HIGH — Q&A extraction |
| BlogPosting | Blog posts | MEDIUM — article/citation targeting |
| Person (author) | Author page, blog posts | MEDIUM — author authority attribution |
| BreadcrumbList | Blog posts, Contact, Author | LOW — structural navigation clarity |
| WebSite | Homepage | LOW — generic wrapper |
| SoftwareApplication | software/ (if applied by geo_fix_all.py) | MEDIUM — app discoverability |
| TechArticle | lorawan/, firmware/ (if applied by geo_fix_all.py) | MEDIUM — expert content signal |

**Note:** FAQPage on commercial sites is restricted per Google's August 2023 policy (gov/health only). However, it still helps AI systems parse content structure even if it doesn't trigger rich results. Consider replacing with inline Q&A format for strict compliance.

---

## 9. Top 5 Highest-Impact Changes

### Priority 1: Create Wikipedia article for Nolilab / Loko GPS Tracker
**Impact:** MASSIVE — Wikipedia is the #1 source for entity recognition by AI systems.
- ChatGPT cites Wikipedia 47.9% of the time
- Enables Knowledge Panel generation
- Provides strongest sameAs link

**How:** Submit nomination at WP:RFN or apply for creation with sufficient independent coverage. The project already has Hackaday features, SeeedStudio blog post, and WildLabs discussion.

### Priority 2: Replace FAQPage schema with inline Q&A + add speakable selectors
**Impact:** HIGH — fixes FAQPage restriction risk while boosting citability.

Replace every `FAQPage` JSON-LD block with this inline pattern:
```html
<h2 id="faq-what-is-loko">What is Loko GPS Tracker?</h2>
<p class="answer-block" itemprop="name">
  Loko is the world's smallest open-source GPS tracker (<strong>28.5 × 20.5 × 5.9 mm</strong>, <strong>14 g</strong>) using LoRa P2P radio. It requires no SIM card, no cellular network, and no subscription fees.
</p>
```

Then add to homepage/head schema:
```json
{
  "@type": "WebPage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".answer-block"]
  }
}
```

### Priority 3: Create YouTube channel with educational content
**Impact:** HIGH — YouTube mentions correlate 0.737 with AI citations (strongest signal after Wikipedia).
- Upload short videos (1–3 min) explaining Loko features
- Embed videos in relevant blog posts
- Videos count as multi-modal content (+156% selection rate)

### Priority 4: Engage on Reddit with helpful Loko content
**Impact:** HIGH — Reddit is cited by Perplexity 46.7% of the time and is a primary ChatGPT source (11.3%).
- Create posts in r/drones, r/LoRa, r/IoT, r/survival, r/GPS explaining real-world Loko use cases
- Do NOT just spam links — provide genuine value
- Link back to blog posts naturally

### Priority 5: Fix llms.txt canonical URLs
**Impact:** LOW-MEDIUM — currently uses `nolilab.com` everywhere but canonical is `www.nolilab.com`.
- Run: `sed -i '' 's|//nolilab\.com/|//www.nolilab.com/|g' llms.txt`

---

## 10. Schema Recommendations

### Add Speakable Specification (to homepage)
```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": ["#hero-headline + p", ".answer-block", "[itemprop='description']"]
  }
}
```

### Add VideoObject for any future explainer videos
```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "How Loko GPS Tracker Works — 2 Minute Demo",
  "description": "Watch how the Loko GPS Tracker tracks assets using LoRa P2P radio without any internet connection.",
  "thumbnailUrl": "https://www.nolilab.com/images/optimized/loko-demo-thumbnail.webp",
  "uploadDate": "2026-08-09",
  "contentUrl": "https://www.youtube.com/watch?v=EXAMPLE",
  "embedUrl": "https://www.youtube.com/embed/EXAMPLE"
}
```

### Add Review/Rating to Product schema (if applicable)
If any third-party review sites exist (Hackaday, SeeedStudio reviews), link them via `review` property in Product schema.

---

## 11. Content Reformatting Suggestions

### Immediate (copy-paste fixable)

1. **Homepage hero paragraph:** Add `class="article-summary"` around the opening paragraph so AI crawlers can identify the lead answer.
   ```html
   <p class="article-summary">Most GPS trackers stop working the moment you leave cell coverage. Loko doesn't. 20 km LoRa range — no SIM card, no subscription, no internet required.</p>
   ```

2. **Feature cards:** Add `class="answer-block"` to each feature card's `<p class="feature-desc">` element so AI systems can extract individual fact blocks.

3. **Blog introduction paragraphs:** Ensure the first 40–55 words of each blog post directly answer the title's implied question, preceded by the keyword or variant.

### Medium-term (rewrite needed)

4. **Add "What is [topic]" sections:** For each major blog topic, start with a definitional paragraph:
   > "LoRa P2P (Point-to-Point) is a wireless communication protocol that enables two devices to transmit data directly to each other without a central gateway or network infrastructure."

5. **Add source attributions:** Where specs are cited, add:
   > "According to SeeedStudio's product listing..." or "Per LoRa Alliance specification v1.0.3..."

---

## Summary Table

| Area | Grade | Quick Wins |
|------|-------|------------|
| AI Crawler Access | A+ | None needed |
| llms.txt | B− | Fix www URLs |
| SS Rendering | A | None needed |
| Schema Markup | B+ | Add speakable, replace FAQPage |
| Entity Signals | C | **Create Wikipedia** |
| Passage Citability | B | Add answer-block classes |
| Multi-Modal | D | Add video content |
| Social Proof | B | Reddit + YouTube activity |

---

## Files Modified

None yet — this is an analysis report.

## Next Steps

1. Apply Priority 5 fix (llms.txt URL correction) — automated via sed
2. Draft Wikipedia article with existing press references
3. Plan YouTube content calendar
4. Schedule Reddit engagement plan
5. Add speakable CSS classes to homepage FAQ section
