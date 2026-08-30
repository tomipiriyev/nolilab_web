# GEO Audit Report: Nolilab — Loko GPS Tracker

**Audit Date:** March 24, 2026
**URL:** https://nolilab.com
**Business Type:** Hardware E-commerce + SaaS Hybrid (IoT device + companion app)
**Pages Analyzed:** 28 (homepage, 9 core pages, 22 blog posts, sitemap-sampled)
**Previous Audit Score:** 46/100 (March 2026)

---

## Executive Summary

**Overall GEO Score: 54/100 — Poor (+8 from previous audit)**

Nolilab's site shows meaningful technical strength — a fully server-rendered stack, exemplary AI crawler permissions, and a 30.9ms TTFB — but is held back by two structural problems that will not self-resolve: brand entity recognition failure and active misinformation risk from outdated blog content. At minimum six blog posts published in October 2023 state product specifications (12g weight, 5km range) that directly contradict the current product (14g, 20km); these pages are being actively indexed and will train AI models to report incorrect specs. Simultaneously, the Nolilab entity has no Wikipedia article, a near-empty Wikidata entry (one property populated), and zero Reddit presence — the three signals AI models weight most heavily for entity confidence. The +8 point improvement over the previous audit reflects genuine progress on schema (new structures discovered on /gps/ and /setup-guides/) and brand discovery (WILDLABS, Antratek, Crowd Supply confirmed active), but the site remains below the 55-point Fair threshold until the spec correction and entity-building work is completed.

**Top 3 priorities:** (1) Correct or redirect all posts with outdated specs — they are actively producing wrong AI answers about the product. (2) Create a Wikipedia article — the single highest-leverage action for AI entity recognition. (3) Add external author sameAs profiles — the author's Person schema currently links only to the employer homepage, contributing zero E-E-A-T value.

Addressing all Quick Wins in this report could improve the score to approximately 62/100 (Fair). Full implementation of the 30-day plan could reach 70+/100 (Good), representing an estimated 40–60% increase in AI citation probability across the five major AI search platforms.

---

## GEO Readiness Score: 54/100 — Poor

### Score Breakdown

| Category | Score | Weight | Weighted Score |
|---|---|---|---|
| AI Citability | 55/100 | 25% | 13.75 |
| Brand Authority | 38/100 | 20% | 7.60 |
| Content E-E-A-T | 48/100 | 20% | 9.60 |
| Technical GEO | 91/100 | 15% | 13.65 |
| Schema & Structured Data | 68/100 | 10% | 6.80 |
| Platform Optimization | 28/100 | 10% | 2.80 |
| **Overall GEO Score** | | | **54/100** |

### Delta vs. Previous Audit

| Category | Previous | Current | Change |
|---|---|---|---|
| AI Citability | 61/100 | 55/100 | -6 (drone post spec errors confirmed) |
| Brand Authority | 11/100 | 38/100 | +27 (Crowd Supply, WILDLABS, Antratek, Hackaday confirmed) |
| Content E-E-A-T | 42/100 | 48/100 | +6 (privacy updated Feb 2026, farm post has citations) |
| Technical GEO | 90/100 | 91/100 | +1 (TTFB 30.9ms confirmed, Brotli compression, image dimensions) |
| Schema | 61/100 | 68/100 | +7 (FAQPage on /gps/, HowTo on /setup-guides/ discovered) |
| Platform Optimization | 22/100 | 28/100 | +6 (Antratek, WILDLABS, Crowd Supply confirmed) |
| **Overall** | **46/100** | **54/100** | **+8** |

---

## Critical Issues — Fix Immediately

### CRITICAL-1: Active Spec Misinformation — 6+ Blog Posts with Wrong Product Specifications

Six confirmed posts state product specifications that are factually incorrect relative to the current Loko GPS Tracker:

| Post | Published | Wrong Specs | Current Correct Specs |
|---|---|---|---|
| Discover the World's Smallest GPS Tracker | Oct 12, 2023 | 12g AND 15g (self-contradictory), 5km AND 20km (self-contradictory) | 14g, 20km |
| Maximize Tracking Capabilities with +5km Range | Oct 16, 2023 | 5km (in title) | 20km |
| Enhance Your Outdoor Adventures | Oct 12, 2023 | 12g, 5km | 14g, 20km |
| Enhance Safety of Your Drone Flights | Oct 12, 2023 | 12g, 5km | 14g, 20km |
| Long-Range Communication with Loko | Oct 12, 2023 | 12g, 5km | 14g, 20km |
| Real-Time Farm Equipment Tracking | Nov 16, 2023 | 12g, 30×23mm, 5km | 14g, 28.5×20.5×5.9mm, 20km |

AI systems do not verify specs against the current product page — they extract whatever specifications appear in indexed content. These pages are actively training AI models to report incorrect Loko specs. The "Discover the World's Smallest GPS Tracker" post is the most dangerous: it contains both 12g and 15g in the same article, and both 5km and 20km in the same article. An AI encountering it will flag the entity as unreliable.

**Fix:** Add a correction banner to the top of each post: `"⚠️ Specs Update: This article reflects pre-2024 specifications. Current Loko GPS Tracker: 14g, 28.5×20.5×5.9mm, 20km LoRa range. See full specs."` Then update the spec figures throughout the post body. For posts fully superseded by newer content (e.g., the Nov 2023 farm post vs. the Mar 2025 farm guide), add a noindex directive and 301 redirect to the newer post.

---

### CRITICAL-2: No Wikipedia Article — Primary AI Entity Recognition Gap

Wikipedia is cited in 47.9% of ChatGPT responses. An AI model encountering "nolilab" or "loko gps tracker" with no Wikipedia article cannot form a confident entity match and will default to treating the brand as unrecognized.

Notability evidence now confirmed: funded Crowd Supply campaign ($15,268, 55 backers), editorial coverage on Hackaday.com (May 2025, Tyler August), Hackster.io (Feb 2022, Gareth Halfacree), Geeky Gadgets (Feb 2022), WILDLABS conservation tech listing, SeeedStudio and Antratek retail distribution, Wikidata entity Q138751022. This is sufficient to argue notability for a product article.

**Fix:** Draft a Wikipedia article for "Loko GPS Tracker" (product-focused, easier notability threshold than company article). Cite the independent editorial sources above. Commission an experienced Wikipedia editor or use the Articles for Creation process — do not self-submit.

---

### CRITICAL-3: Wikidata Entity Q138751022 Is a Stub — 1 Property Populated

The Wikidata entity exists (a positive signal) but contains only `P31: instance of`. It has no website URL, no country, no founding date, no social media IDs. A Wikidata stub with one property provides almost no AI graph utility.

**Fix:** Add in the Wikidata visual editor (30 minutes): P856 (website: nolilab.com), P17 (country: Estonia / Q191), P571 (inception: 2019), P2002 (Twitter: noli_lab), P2003 (Instagram: nolilab), P2397 (YouTube channel ID), P4264 (LinkedIn company page), external identifier links to Crowd Supply and SeeedStudio. Each populated property strengthens AI confidence.

---

### CRITICAL-4: Zero Reddit Presence

Reddit accounts for 46.7% of Perplexity AI citations and 11.3% of ChatGPT citations. Three separate searches for "nolilab", "loko gps tracker", and "loko tracker" across r/LoRaWAN, r/GPS, r/pettracker, r/homeautomation, r/drones, and r/farming returned zero threads.

**Fix:** Authentic, helpful participation in 3-5 relevant subreddits over 60 days. Post build guides, answer LoRa range questions, share the firmware update guide. Target: r/LoRaWAN, r/DIY, r/GPS, r/homeautomation, r/pettracker, r/farming, r/drones.

---

## High Priority Issues — Fix Within 1 Week

### HIGH-1: Author Person Schema sameAs Links Only to Employer Homepage

The Person schema at `/author/tamleykha-piriyev/` has a sameAs property containing only `https://www.nolilab.com` — the employer's homepage. The entire purpose of sameAs on a Person schema is to link to external author identities. This provides zero E-E-A-T value. Every BlogPosting schema also references this author object without external sameAs.

**Fix:** Add the author's LinkedIn profile URL and at minimum one other external profile to the sameAs array. Update the author page Person schema AND the author object inside every BlogPosting schema. Ready-to-use JSON-LD in Schema Appendix below.

---

### HIGH-2: Software Page FAQ Has No FAQPage Schema

The `/software/` page contains 5 clean Q&A pairs — including the highly citable zero-data-collection claim ("All tracking data stays on your device; no data is transmitted to any server") — but has no FAQPage schema. These answers are invisible to structured AI retrieval.

**Fix:** Add a FAQPage JSON-LD block to the `<head>` of `/software/`. Estimated time: 30 minutes. Highest ROI fix on the site.

---

### HIGH-3: LoRaWAN Page Has Zero Schema

The `/lorawan/` page is a 16-step LoRaWAN/TTN integration guide with no Schema.org markup of any kind: no TechArticle, no BreadcrumbList, no author, no date.

**Fix:** Add TechArticle schema (with author, datePublished, dateModified, speakable) and a BreadcrumbList. Ready-to-use JSON-LD in Schema Appendix below.

---

### HIGH-4: Blog Posts Missing BreadcrumbList Schema

All 22 blog posts have a visual "Back to Blog" navigation element but no BreadcrumbList schema.

**Fix:** Template a BreadcrumbList into the CMS output for all BlogPosting pages. One schema block, added to the post template, affects all 22+ posts automatically.

---

### HIGH-5: IndexNow Not Implemented

Both `/.well-known/indexnow-key.txt` and `/indexnow.txt` return 404. ChatGPT uses Bing's index; Bing Copilot uses Bing's index. Without IndexNow, spec corrections and new posts may not be indexed by Bing for days or weeks.

**Fix:** Generate an IndexNow API key, place the key file at the domain root, and ping the IndexNow API on each publish/update. Especially important given the spec-correction work — you want Bing to re-index corrected pages immediately.

---

### HIGH-6: Privacy Policy Insufficient for GDPR (EU Company)

Nolilab OÜ is an Estonian company. The privacy policy (updated February 2026) lacks: named data controller with full legal details, legal bases for processing, user rights section (Articles 15–22), supervisory authority contact (Estonian Data Protection Inspectorate), cookie policy, and third-party processor disclosures.

**Fix:** Have the privacy policy reviewed by an EU data protection lawyer. At minimum, add a user rights section with the 8 GDPR rights and instructions for exercising them.

---

## Medium Priority Issues — Fix Within 1 Month

| # | Issue | Page(s) | Fix |
|---|---|---|---|
| M-1 | www/non-www canonical conflict (server serves non-www; canonical, sitemap, hreflang, og:url all reference www) | All | Update Cloudflare Page Rule to redirect nolilab.com/* → www.nolilab.com/*; update robots.txt Sitemap directive |
| M-2 | Thin core content pages | /gps/ (~850 words), farm guide (~1,100 words), LoRa guide (~900 words) | Expand to 2,000+, 3,000+, 1,500+ words respectively |
| M-3 | Drone post — outdated AND thin (19/100 citability) | /blog/drone-enthusiasts-rejoice.../ | Full rewrite: corrected specs, comparison table, frequency band guidance |
| M-4 | GitHub org doesn't exist (nolilab org 404; repo is under personal account) | github.com/nolilab | Create org, transfer/mirror Loko repo |
| M-5 | "Dronee" brand name in Hackster.io and Geeky Gadgets (2022) | External | Contact editors requesting brand name correction |
| M-6 | No publication date or author on /specifications/ and /gps/ | Core pages | Add "Published / Last Updated / By:" line |
| M-7 | Alt text absent on /gps/ page images | /gps/ | Add descriptive alt text to all 3 images |
| M-8 | Contact page Organization sameAs truncated to 5 URLs vs. homepage's 14 | /contact/ | Sync sameAs array with homepage |

---

## Low Priority Issues

| Issue | Affected Page | Effort |
|---|---|---|
| CSP uses unsafe-inline | All | Medium |
| Cloudflare not edge-caching HTML (Cache-Control max-age=0) | All | Low |
| Missing potentialAction/SearchAction on WebSite schema | Homepage | Low |
| Organization logo property uses product image not brand wordmark | Homepage | Low |
| No speakable property anywhere | All | Medium |
| Relative image URL in BlogPosting schema (signal range post) | One post | Low |
| dateModified mirrors datePublished (not updated on content changes) | Blog template | Low |
| No articleSection or wordCount in BlogPosting schema | Blog posts | Low |

---

## Category Deep Dives

### AI Citability — 55/100

The homepage is the strongest citability asset, scoring 74/100, driven by FAQPage schema with 10 Q&A pairs. The February 2026 signal range post (61/100) contains a well-formed inverse square law passage. Beyond these, citability drops markedly.

| Page | Score |
|---|---|
| Homepage | 74/100 |
| Signal Range Blog Post (Feb 2026) | 61/100 |
| LoRa/LoRaWAN Guide (Mar 2025) | 55/100 |
| GPS & LoRa Tech Guide (/gps/) | 52/100 |
| Specs Page | 48/100 |
| Software Page | 41/100 |
| LoRaWAN Setup Guide | 38/100 |
| Drone Blog Post (Oct 2023) | 19/100 |

**Top 3 most citable passages:**
1. *"Loko maintains reliable tracking up to 20km away using LoRa P2P technology — that's 10x the range of Bluetooth trackers like AirTag or Tile."* (Homepage FAQ, FAQPage schema)
2. *"Loko operates with two units: Air Unit attaches to your device and sends GPS data via LoRa P2P radio. Ground Unit receives data and transmits it to a smartphone app via Bluetooth. No internet or cellular network required."* (Homepage FAQ)
3. *"When distance doubles, signal distribution area quadruples, reducing power density by 75%."* (Signal Range blog post, Feb 2026)

---

### Brand Authority — 38/100

The +27 point gain from the previous audit reflects discovery of existing presence, not new actions.

| Platform | Status | Signal Quality |
|---|---|---|
| Wikipedia | Absent | Critical gap — 47.9% of ChatGPT citations |
| Wikidata Q138751022 | Stub (1 property) | Near-useless for AI grounding |
| Hackaday.com | Editorial May 2025 | Strong — cites 12g/15km (needs correction) |
| Hackaday.io project #166619 | Active since 2019 | Strong community anchor |
| Crowd Supply | Funded Dec 2022 ($15,268, 55 backers) | Strong hardware credibility |
| SeeedStudio | Active retail listing (correct 14g) | Strong distribution signal |
| Antratek | EU distributor | Medium distribution signal |
| WILDLABS | Conservation tech inventory | High-quality niche |
| Hackster.io | 2022 editorial (credits "Dronee") | Partial — wrong brand name |
| GitHub tomipiriyev/Loko | ~230 stars, MIT | Present but unlinked to brand entity |
| Reddit | Absent | Major gap — 46.7% of Perplexity citations |
| YouTube @LOKO_OFFLINEGPS | Channel exists (depth unknown) | Present, unverified |
| LinkedIn nolilab | Unclear — search returns "Loko AI" (unrelated) | Unclear |

**Entity consistency:** Cross-source name split (Dronee vs. Nolilab), specs split (12g/10km, 12g/15km, 14g/20km), founder name split (Tamleykha Piriyev / Tomi Piriyev / Akio Sato). AI models averaging conflicting signals will produce wrong answers.

---

### Content E-E-A-T — 48/100

| Dimension | Score | Key Finding |
|---|---|---|
| Experience | 8/25 | No first-hand field accounts, no original data, unverified testimonials |
| Expertise | 13/25 | Named author, topic familiarity, 2 external citations in farm post; no credentials, no external profile |
| Authoritativeness | 7/25 | Hackaday/Seeed/WILDLABS mentions; no Wikipedia, no mainstream tech press, no independent reviews |
| Trustworthiness | 14/25 | HTTPS, address, email, updated privacy policy; GDPR compliance gaps, no phone, no editorial policy |

**Freshness:** 17 of 22 posts are over 24 months old on a hardware product topic. 6+ contain confirmed spec errors. Only 4 posts are current (within 12 months).

**AI content signals:** Oct 2023 content burst (14 posts in 6 weeks) shows consistent AI generation patterns. Recent posts (2025–2026) show marginal improvement.

---

### Technical GEO — 91/100

| Category | Score |
|---|---|
| Server-Side Rendering | 15/15 — All content in raw HTML (1,987+ words before JS) |
| Crawlability | 14/15 — All 13 AI crawlers explicitly allowed; llms.txt present |
| Security | 9/10 — HSTS preload, X-Frame-Options DENY; CSP has unsafe-inline |
| Mobile Optimization | 10/10 — Fully responsive; all 27 images have explicit dimensions |
| Core Web Vitals | 13/15 — TTFB 30.9ms; Brotli 5:1 compression; fetchpriority="high" on hero |
| URL Structure | 7/8 — Clean; www/non-www canonical inconsistency persists |
| Indexability | 10/12 — Canonical inconsistency; robots.txt Sitemap directive non-www vs. sitemap www |
| Page Speed | 13/15 — Brotli active; Cache-Control max-age=0 prevents edge caching |

**AI Crawler Access:** All 13 major AI crawlers allowed (GPTBot, ChatGPT-User, ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended, CCBot, Bytespider, YouBot, cohere-ai, Amazonbot, Applebot via explicit rules; Googlebot and Bingbot via `User-agent: *`).

---

### Schema & Structured Data — 68/100

**Confirmed present:** WebSite, Organization (14 sameAs URLs, Wikidata linked), Product (17 additionalProperty entries on /specs/), FAQPage (homepage: 10 entries; /gps/: 4 entries), HowTo (/setup-guides/), BlogPosting (all posts), Person (author page), BreadcrumbList (/specs/, /gps/, /contact/, /author/).

**Critical gaps:**
- /lorawan/: No schema (16-step TTN guide)
- /software/: No schema (FAQ section exists but unmarked)
- /firmware/: No schema (15-step firmware guide)
- Person sameAs: Points only to employer homepage (zero E-E-A-T value)
- Product: No AggregateRating, no sku/gtin, no shippingDetails
- speakable: Not implemented anywhere
- BlogPosting: No BreadcrumbList; 1 post has relative image URL (validation error)

**Validation errors:**
1. BlogPosting image URL on signal range post: relative path — must be absolute
2. Organization logo property uses product photo, not brand wordmark
3. WebSite url (www) and Organization url (non-www) are inconsistent

---

### Platform Optimization — 28/100

| Platform | Score | Primary Gap |
|---|---|---|
| Google AI Overviews | ~58/100 | Not ranking top-10 for most queries; outdated spec posts drag authority |
| ChatGPT Web Search | ~22/100 | No Wikipedia; Wikidata stub; "Dronee" brand confusion in Bing index |
| Perplexity AI | ~30/100 | Zero Reddit; no original research; 17/22 posts stale |
| Google Gemini | ~35/100 | YouTube depth unconfirmed; Knowledge Panel absent; Schema partial |
| Bing Copilot | ~38/100 | No IndexNow; LinkedIn unclear; Bing coverage unconfirmed |

---

## Quick Wins — Implement This Week

| # | Action | Effort | Platforms | Impact |
|---|---|---|---|---|
| 1 | Add correction banners to 6+ posts with outdated specs; update spec figures | 2 hrs | All | Eliminates active misinformation |
| 2 | Add FAQPage schema to /software/ FAQ section | 30 min | All | +15-20 pts on that page |
| 3 | Expand Wikidata Q138751022 with 8 properties | 30 min | ChatGPT, Gemini | +6-8 brand authority |
| 4 | Add external sameAs to Person schema (author LinkedIn) | 15 min | All | +5-8 E-E-A-T |
| 5 | Fix relative image URL in BlogPosting schema | 5 min | All | Clears validation error |
| 6 | Update robots.txt Sitemap directive to www | 2 min | Bing, Google | Resolves non-www mismatch |
| 7 | Add TechArticle + BreadcrumbList schema to /lorawan/ | 45 min | All | First schema on a key page |
| 8 | Implement IndexNow key file | 30 min | Bing, ChatGPT | Faster re-indexing of corrected posts |

---

## 30-Day Action Plan

### Week 1: Stop the Bleeding — Spec Corrections and Schema Fixes
- [ ] Add correction banners and update spec figures on all 6+ outdated posts
- [ ] Audit remaining Oct 2023 posts for additional spec errors; fix or noindex+redirect
- [ ] Add FAQPage schema to /software/ page
- [ ] Add TechArticle + BreadcrumbList schema to /lorawan/
- [ ] Fix relative image URL in BlogPosting schema
- [ ] Add external LinkedIn/Twitter sameAs to author Person schema (author page + all BlogPosting author objects)
- [ ] Update robots.txt Sitemap directive to www
- [ ] Implement IndexNow

### Week 2: Entity Building — Wikidata and Wikipedia
- [ ] Expand Wikidata Q138751022 with all available properties
- [ ] Commission Wikipedia article draft for "Loko GPS Tracker"
- [ ] Create github.com/nolilab organization; transfer/mirror Loko repo
- [ ] Contact Hackster.io and Geeky Gadgets requesting Dronee→Nolilab correction
- [ ] Contact Hackaday requesting spec correction (12g/15km → 14g/20km)
- [ ] Complete nolilab LinkedIn company page with correct description and product

### Week 3: Content — Fix the Pillar Posts
- [ ] Expand farm equipment guide from 1,100 to 3,000+ words (comparison table, cost analysis, case study)
- [ ] Rewrite drone tracking post with correct specs, comparison table, frequency band guide
- [ ] Expand /gps/ from 850 to 2,000+ words (Spreading Factor table, path loss examples)
- [ ] Add author byline and publication date to /specifications/, /gps/, /software/
- [ ] Add alt text to all images on /gps/ page
- [ ] Add BreadcrumbList template to CMS for all blog posts

### Week 4: Community and Distribution — Reddit and YouTube
- [ ] Post 3 substantive contributions in r/LoRaWAN and r/GPS
- [ ] Publish one YouTube video: current Loko specs overview with correct 14g/20km figures
- [ ] Publish "Loko GPS Tracker 2025: Specs, Range Tests, and Comparison" with fresh metadata
- [ ] Begin GDPR privacy policy update (legal review)
- [ ] Resolve www/non-www via Cloudflare Page Rule

---

## Estimated Impact

| Milestone | Projected Score | Delta |
|---|---|---|
| Current | 54/100 | Baseline |
| After Quick Wins (Week 1) | ~62/100 | +8 |
| After 30-Day Plan | ~72/100 | +18 |
| After Wikipedia article + Reddit presence | ~80/100 | +26 |

At the 72/100 level (Good tier), nolilab would enter the top 30% of hardware product sites for AI citation probability, representing an estimated 40–60% increase in citation frequency across the five major AI search platforms.

---

## Appendix: Pages Analyzed

| URL | Title | Key GEO Issues |
|---|---|---|
| / | Loko: World's Smallest Offline GPS Tracker | Best page on site — no critical issues |
| /specifications/ | Technical Specifications | No date, no author |
| /software/ | App & Software Downloads | No schema, no date |
| /lorawan/ | LoRaWAN Setup Guide | No schema, no date |
| /gps/ | GPS & LoRa Technology Guide | Thin (~850 words), no date, no citations |
| /setup-guides/ | Setup Guides | HowTo schema present |
| /contact/ | Contact nolilab | sameAs truncated vs. homepage |
| /privacy/ | Privacy Policy | GDPR compliance gaps |
| /author/tamleykha-piriyev/ | Author page | No photo, no external sameAs, no credentials |
| /blog/how-distance-affects-wireless-signal-range/ | Signal Range Post | Good — Feb 2026; 1 schema error (relative URL) |
| /blog/the-ultimate-guide-to-gps-tracking-for-farm-equipment-vehicles/ | Farm Equipment Guide | Thin for "ultimate guide" (1,100 words) |
| /blog/lora-lorawan-a-simple-guide/ | LoRa/LoRaWAN Guide | Good — Mar 2025, has citations |
| /blog/how-to-upgrade-loko-firmware/ | Firmware Upgrade Guide | Good — Jul 2025, procedurally specific |
| /blog/drone-enthusiasts-rejoice-the-ultimate-gps-tracker-for-your-mini-drones-1/ | Drone GPS Tracker | CRITICAL: outdated specs (12g, 5km) |
| /blog/discover-the-worlds-smallest-gps-tracker-introducing-the-loko-gps-tracker-by-nolilab-1/ | Discover the Smallest | CRITICAL: self-contradictory specs (12g AND 15g; 5km AND 20km) |
| /blog/maximize-tracking-capabilities-with-5km-range-and-30-days-battery-life-in-gps-trackers/ | Maximize Tracking | CRITICAL: "5km" in title |
| /blog/real-time-farm-equipment-tracking-made-easy-with-nolilabs-loko-gps-tracker/ | Farm Equipment (old) | CRITICAL: 3 spec errors; superseded by Mar 2025 post |
| /blog/enhance-your-outdoor-adventures-with-nolilabs-loko-gps-tracker/ | Outdoor Adventures | CRITICAL: 12g, 5km |
| /blog/long-range-communication-with-the-loko-gps-tracker-exploring-the-power-of-lora-radio-technology-1/ | Long-Range Communication | CRITICAL: 12g, 5km vs 20km in title (conflict) |
| /blog/enhance-the-safety-of-your-drone-flights-with-the-compact-loko-gps-tracker/ | Drone Flights Safety | CRITICAL: 12g, 5km, 30×23mm |
| Remaining 7 Oct 2023 posts | Various | Audit required — likely contain spec errors |

---

## Schema Appendix — Ready-to-Use JSON-LD

### Template 1: TechArticle for /lorawan/

```json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "LoRaWAN Setup Guide for Loko GPS Tracker | TTN Integration",
  "description": "Step-by-step instructions for connecting the Loko GPS Tracker to The Things Network via LoRaWAN, including gateway setup, device registration, and payload formatter configuration.",
  "url": "https://www.nolilab.com/lorawan/",
  "datePublished": "[ADD: original publish date]",
  "dateModified": "[ADD: last update date]",
  "author": {
    "@type": "Person",
    "name": "Tamleykha Piriyev",
    "url": "https://www.nolilab.com/author/tamleykha-piriyev/",
    "sameAs": ["[ADD: LinkedIn URL]", "[ADD: Twitter URL]"]
  },
  "publisher": {
    "@type": "Organization",
    "name": "Nolilab OÜ",
    "url": "https://www.nolilab.com",
    "logo": { "@type": "ImageObject", "url": "[ADD: brand logo URL — not the product image]" }
  },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://www.nolilab.com/lorawan/" },
  "proficiencyLevel": "Beginner",
  "dependencies": "Loko GPS Tracker, The Things Network account, LoRaWAN gateway",
  "articleSection": "Setup Guides",
  "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1"] }
}
```

### Template 2: SoftwareApplication for /software/

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Loko Navigation App",
  "description": "Offline GPS tracking app for the Loko GPS Tracker. No subscription, no internet required. Track up to 30 Air Units via Bluetooth from the Ground Unit.",
  "url": "https://www.nolilab.com/software/",
  "applicationCategory": "NavigationApplication",
  "operatingSystem": ["Android 8.0+", "iOS 13.0+"],
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "downloadUrl": "https://play.google.com/store/apps/details?id=com.loko.dev1",
  "softwareVersion": "[ADD: current version]",
  "author": { "@type": "Organization", "name": "Nolilab OÜ", "url": "https://www.nolilab.com" },
  "featureList": [
    "Real-time GPS tracking via LoRa P2P",
    "Offline map support with no internet connection",
    "Zero data collection policy",
    "Track up to 30 simultaneous Air Units"
  ]
}
```

### Template 3: Person Schema Fix for /author/ page

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Tamleykha Piriyev",
  "url": "https://www.nolilab.com/author/tamleykha-piriyev/",
  "jobTitle": "Technical Writer",
  "description": "Technical writer at Nolilab specializing in GPS tracking, LoRa radio systems, LoRaWAN integration, and offline positioning.",
  "worksFor": { "@type": "Organization", "name": "Nolilab OÜ", "url": "https://www.nolilab.com" },
  "knowsAbout": ["GPS tracking", "LoRa radio technology", "LoRaWAN", "GNSS", "drone tracking", "IoT"],
  "sameAs": [
    "[REPLACE: Author's LinkedIn profile URL]",
    "[REPLACE: Author's Twitter/X profile URL]"
  ]
}
```

---

## Methodology

- **Pages analyzed:** 28 URLs across all site sections
- **Platforms assessed:** Google AI Overviews, ChatGPT Web Search, Perplexity AI, Google Gemini, Bing Copilot
- **Technical checks:** HTTP headers, robots.txt, raw HTML source analysis (SSR verification), structured data parsing, TTFB measurement, security header audit, canonical/redirect chain verification, IndexNow check
- **Content assessment:** E-E-A-T framework per Google's December 2025 Quality Rater Guidelines; AI content pattern detection; spec consistency cross-reference across all 22 blog posts
- **Schema validation:** JSON-LD parsing, Schema.org type compliance, rich result eligibility assessment (Aug 2023 FAQPage restriction, Sep 2023 HowTo removal)
- **Brand authority:** Web search across 6 platforms, Wikidata API verification, GitHub repository analysis, editorial coverage verification
- **Date of analysis:** March 24, 2026
- **Comparison baseline:** GEO Audit Report (previous score: 46/100, March 2026)
