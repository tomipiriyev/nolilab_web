# GEO Platform Optimization Report — nolilab.com
**Date:** March 21, 2026
**Site:** https://nolilab.com — Loko GPS Tracker (Nolilab OÜ, Tallinn, Estonia)
**Industry:** Hardware / IoT / GPS Tracking (LoRa P2P offline GPS)

---

## Overall Platform Readiness

**Combined GEO Score: 37/100**

This average reflects a wide gap between the site's technical excellence and its platform-specific optimization. Google AI Overviews scores highest because the site has well-structured FAQs and comparison tables that match AIO's content preferences. All other platforms score Weak due to the absence of entity recognition infrastructure (Wikipedia, Wikidata) and community presence (Reddit).

**Important context from platform research:** This audit uncovered brand presence that was not visible in the initial GEO audit:
- Hackaday editorial article (May 2025): "2025 Pet Hacks Contest: Loko Tracks Fido With LoRa And GPS" by Tyler August — 7 reader comments
- Hackster.io editorial: "Dronee's Loko Is a Tiny Open Source LoRa Asset Tracker"
- Hackaday.io project page (project #166619): active project logs dating from 2019
- Crowd Supply campaign: **fully funded** — $15,268 raised from 55 backers (December 2022)
- SeeedStudio product listing: live and active at seeedstudio.com
- Antratek: second electronics distributor carrying the product
- lokofarm.com: separate Nolilab-operated domain targeting agricultural use case

**Critical spec discrepancy detected across the web:** Hackaday (May 2025) and Hackster.io still report the product as "12 grams" and "15km range" / "10km range." The current product is 14g and 20km. When AI systems search for "Loko GPS tracker" specifications, they find conflicting information across sources. This is actively damaging AI citability accuracy and must be addressed by contacting the editors of these publications.

---

## Platform Scores

| Platform | Score | Status |
|---|---|---|
| Google AI Overviews | 58/100 | Moderate |
| ChatGPT Web Search | 22/100 | Weak |
| Perplexity AI | 30/100 | Weak |
| Google Gemini | 36/100 | Weak |
| Bing Copilot | 38/100 | Weak |
| **Combined Average** | **37/100** | **Weak** |

*Status thresholds: Strong = 70+, Moderate = 40–69, Weak = 0–39*

---

## Platform 1: Google AI Overviews — 58/100 (Moderate)

### How Google AIO Works (for context)
92% of AIO citations come from pages already ranking in the top 10 organic results. However, 47% of citations come from pages ranking below position 5, because AIO selects for clarity and direct answers rather than raw ranking position. Tables, FAQ sections, and direct-answer paragraphs are the structural signals AIO responds to most strongly.

### Score Breakdown

| Criterion | Points Available | Score | Evidence |
|---|---|---|---|
| Ranks in top 10 for target queries | 20 | 8 | Likely ranks top 10 for branded "Loko GPS tracker" queries; unlikely top 10 for category queries ("offline GPS tracker", "LoRa GPS tracker for drones") without confirmed backlink authority |
| Question-based headings | 10 | 6 | Homepage FAQ uses question H3s; blog posts use some question-style H2s (e.g., "Why GPS Tracking Matters in Agriculture"); not consistent across all pages |
| Direct answers after headings | 15 | 9 | FAQ answers are generally direct; range answer ("20km... 10x the range of Bluetooth") is excellent; "How does Loko work?" answer is truncated after the Air Unit description |
| Tables for comparison data | 10 | 10 | ✅ Two comparison tables on homepage: technology comparison (LoRa vs. cellular vs. satellite) and competitor table (vs. Tile, AirTag); specifications table on /specifications/ |
| Lists for processes/features | 10 | 8 | Feature lists present; use case lists present; setup guide uses ordered lists |
| FAQ section with 5+ questions | 10 | 10 | ✅ 10 FAQ entries with FAQPage schema markup |
| Statistics with citations | 10 | 4 | Product specs (self-asserted, no external validation); LoRa guide has 4 external citations; homepage stats uncited |
| Publication/updated date visible | 5 | 2 | Blog posts have publication dates; most product/pillar pages have no visible dates |
| Author byline with credentials | 5 | 2 | Author name (Tamleykha Piriyev) visible on blog posts; credentials not shown; author bio exists but has no academic credentials |
| Clean URL + heading hierarchy | 5 | 4 | Clean URLs; H1>H2>H3 mostly correct; minor issue on /blog/how-distance-affects-wireless-signal-range/ (6 H2s for 220 words) |
| **Total** | **100** | **63 → 58*** | *Adjusted downward to reflect that AIO visibility ultimately depends on organic ranking, which cannot be confirmed at top-10 for competitive queries |

### Gaps for Google AIO

**Gap 1 — Truncated FAQ answers reduce AIO extraction quality.** The "How does Loko GPS Tracker work with LoRa P2P?" answer ends after describing the Air Unit: *"Loko operates with two units: Air Unit (transmitter) attaches to your device and sends GPS data via LoRa P2P radio."* This is an incomplete answer. AIO would cite a truncated passage that fails to explain what the user actually does with the product.

**Gap 2 — Statistics are self-asserted, not externally validated.** AIO prefers statistics it can cross-reference. The "20km range" claim appears only on nolilab.com and in the product schema — and conflicts with the "15km range" figure still live on Hackaday (May 2025). AIO may quote the Hackaday figure instead of the correct one.

**Gap 3 — No publication dates on pillar pages.** The /gps/, /lorawan/, /specifications/, and /software/ pages have no visible date. AIO deprioritizes undated content for queries where freshness signals matter.

**Gap 4 — No statistics with external citations on the homepage.** All homepage statistics are self-asserted. Adding even one independently verifiable figure ("According to the LoRa Alliance, LoRa P2P achieves up to 22km in open terrain") would strengthen AIO candidacy.

### Google AIO Priority Actions

1. **Fix the "How does Loko work?" FAQ answer** — Complete it to describe the full system flow (Air Unit → Ground Unit → app display). This is the most-queried FAQ topic and the answer is currently cut off.
2. **Contact Hackaday and Hackster.io editors** requesting spec updates (12g → 14g; 15km → 20km). Conflicting specs across authoritative sources directly undermine AIO accuracy for product queries.
3. **Add visible dates to all pillar pages** (/gps/, /lorawan/, /specifications/) with a "Last reviewed: [month year]" notice.
4. **Add one externally-cited statistic per pillar page** — link to LoRa Alliance, IEEE, or FCC documentation to anchor technical claims.

---

## Platform 2: ChatGPT Web Search — 22/100 (Weak)

### How ChatGPT Web Search Works (for context)
ChatGPT uses Bing's search index and assigns heavy weight to entity-anchored results. Wikipedia accounts for 47.9% of ChatGPT citations across topics. Without a Wikipedia article or Wikidata entity, ChatGPT has no anchor point to identify "Nolilab" as a known, trusted brand. It will find the website in Bing's index but treat it as an unverified source.

### Score Breakdown

| Criterion | Points Available | Score | Evidence |
|---|---|---|---|
| Wikipedia article exists | 20 | 0 | No Wikipedia article for Nolilab or Loko GPS Tracker |
| Wikidata entity with 5+ properties | 10 | 0 | No Wikidata entry found |
| Bing index coverage of key pages | 10 | 5 | Bing likely indexes the site (Cloudflare/standard site), but coverage is unverified; no Bing Webmaster Tools confirmation |
| Reddit brand mentions (positive) | 10 | 0 | No confirmed Reddit discussions in r/LoRa, r/GPS, r/drones, or r/homeautomation |
| YouTube channel with relevant content | 10 | 5 | Official channel exists (@nolilab_loko_gps); no third-party reviews found; subscriber/view count unconfirmed |
| Authoritative backlinks (.edu, .gov, press) | 15 | 6 | **Hackaday editorial** (May 2025) + **Hackster.io editorial** + **Hackaday.io project page** = maker-community authority links. No .edu, .gov, or mainstream tech press links. |
| Entity consistency across platforms | 10 | 4 | CRITICAL: Hackaday/Hackster show "12g, 15km" — nolilab.com shows "14g, 20km." Entity data is inconsistent across public sources. ChatGPT will have conflicting spec data. |
| Content comprehensiveness (2000+ words) | 10 | 5 | Homepage ~3,400 words ✅; LoRa guide ~1,200 words (adequate); farm guide 650 words (thin); signal range article 220 words (very thin) |
| Bing Webmaster Tools configured | 5 | 0 | Not confirmed; IndexNow not implemented |
| **Total** | **100** | **25 → 22*** | *Adjusted for the entity inconsistency severity |

### Gaps for ChatGPT

**Gap 1 — No Wikipedia or Wikidata entity (most critical).** ChatGPT cannot confidently cite or describe a brand that has no structured entity record. The Crowd Supply campaign (Dec 2022, 55 backers, $15,268 raised) and Hackaday editorial coverage (May 2025) are sufficient "notability" grounds to pursue a Wikipedia article. This is the highest-leverage action for ChatGPT visibility.

**Gap 2 — Spec conflict between nolilab.com and Hackaday/Hackster.** ChatGPT's Bing-powered search will find Hackaday (a higher-authority domain) potentially before nolilab.com for some queries. When Hackaday says "12g" and nolilab.com says "14g," ChatGPT may reproduce the wrong specification in answers.

**Gap 3 — No Reddit engagement.** 11.3% of ChatGPT citations come from Reddit. Zero confirmed Reddit threads mention Loko or Nolilab, meaning ChatGPT has no community-validated discussion to reference for questions like "is Loko GPS tracker worth it?" or "LoRa GPS tracker recommendations."

**Gap 4 — Bing Webmaster Tools not configured.** Without Bing WMT, there is no visibility into how Bing indexes the site, what crawl errors exist, or how to optimize the submission.

### ChatGPT Priority Actions

1. **Create a Wikidata item for Nolilab OÜ** — this can be done today without press coverage. Include: @type = Organization, foundingDate, country, officialWebsite, product (Loko GPS Tracker), sameAs links. This is the single fastest path to ChatGPT entity recognition.
2. **Contact Hackaday (Tyler August) and Hackster.io** to correct the spec data in published articles (12g → 14g, 10-15km → 20km). These corrections will propagate to ChatGPT's Bing-sourced knowledge.
3. **Submit to Bing Webmaster Tools** at bing.com/webmasters. Verify the site, submit the sitemap, and review the index coverage report.
4. **Initiate Reddit presence** — a genuine "I made this" post with demo video in r/LoRa and r/GPS, transparently disclosed as the creator, is the fastest path to community discussion that ChatGPT can cite.

---

## Platform 3: Perplexity AI — 30/100 (Weak)

### How Perplexity Works (for context)
Perplexity cites 5–15 sources per answer, giving mid-authority sites more opportunity than Google AIO or ChatGPT. Reddit accounts for 46.7% of Perplexity citations. The platform places special weight on community-validated content — forum threads where multiple people discuss and validate a claim are highly preferred over single-publisher assertions.

### Score Breakdown

| Criterion | Points Available | Score | Evidence |
|---|---|---|---|
| Active Reddit presence | 20 | 0 | No confirmed Reddit threads. This single gap accounts for 46.7% of Perplexity's citation pool. |
| Forum/community (HN, SO, Quora) | 10 | 3 | Hackaday.io project logs (maker community); Crowd Supply campaign comments (55 backers). These are relevant community signals, but not the high-volume discussion platforms Perplexity weights most heavily. |
| Content freshness (< 6 months) | 10 | 7 | Most recent post: Feb 2026 ✅; several 2025 posts ✅; Nov 2023 batch not updated ⚠️ |
| Original research/data | 15 | 5 | LoRa data rate chart (original); all other content is educational summary; no field test data, no proprietary benchmarks |
| YouTube content | 10 | 5 | Official channel exists; no confirmed video transcripts or active posting; no third-party product reviews found |
| Quotable, standalone paragraphs | 10 | 6 | Range FAQ answer, spec hero copy, spreading factor definition are all quotable. Multiple thin articles pull the average down. |
| Multi-source claim validation | 10 | 4 | LoRa guide: 4 external links ✅; most other articles: 0 citations. Claims are asserted, not cross-validated. |
| Discussion-generating content | 10 | 2 | Content is informational/promotional rather than opinion, research, or contrarian. It does not invite community discussion. |
| Wikipedia/Wikidata | 5 | 0 | Neither exists |
| **Total** | **100** | **32 → 30*** | |

### Gaps for Perplexity

**Gap 1 — Zero Reddit presence.** A single well-received post in r/LoRa (6,000+ members) or r/GPS documenting the product or sharing test data would immediately become one of Perplexity's primary sources for "LoRa GPS tracker" queries. This is the fastest path to Perplexity visibility.

**Gap 2 — No original research or field data.** Perplexity heavily favors primary data sources. A blog post titled "Loko LoRa Range Test Results: 12 Environments, Real RSSI Measurements" would be a primary data source that Perplexity would cite repeatedly for "how far does LoRa GPS work?" queries.

**Gap 3 — Content doesn't invite community sharing.** Perplexity cites content that gets discussed. Product specs pages do not get shared on forums. A provocative or data-rich post ("We tested every sub-$100 GPS tracker. LoRa beat cellular by 200x for our use case.") would generate the community discussion that feeds Perplexity's citation engine.

**Gap 4 — Hackaday.io project page is an underutilized asset.** The Hackaday.io project (#166619) with logs going back to 2019 is exactly the kind of community-validated, developer-facing content Perplexity values. Updating this project page with current specs and linking to the nolilab.com commercial product would strengthen this signal.

### Perplexity Priority Actions

1. **Post on Reddit** — r/LoRa and r/GPS first, then r/drones and r/homeautomation. Write a genuine "I made this" post with a demo video showing the product working in a real use case. This single action addresses the platform's most weighted citation source.
2. **Publish one original data article** — "Loko LoRa Range Tests: Real RSSI Measurements at 1km, 5km, 10km, 20km" with actual field data from your hardware. Original research is Perplexity's second most preferred content type after community discussion.
3. **Update the Hackaday.io project page** (#166619) with current specs (14g, 20km), link to the SeeedStudio listing, and add a log entry about the product evolution. This is an existing high-credibility platform asset that can be improved in 30 minutes.
4. **Create YouTube video content with transcripts** — Perplexity indexes YouTube transcripts. A 5-minute demo video titled "Loko GPS Tracker: 20km LoRa range test in open terrain" with a full description and auto-captions would give Perplexity a video source to cite.

---

## Platform 4: Google Gemini — 36/100 (Weak)

### How Gemini Works (for context)
Gemini uses Google's full search index but places extra weight on Google-owned properties: YouTube most significantly, then Google Business Profile, and the Google Knowledge Graph (powered by entity recognition from structured data and Wikipedia). A brand with a Knowledge Panel is far more likely to be cited by Gemini than one without.

### Score Breakdown

| Criterion | Points Available | Score | Evidence |
|---|---|---|---|
| Google Knowledge Panel | 15 | 0 | No Knowledge Panel detected for Nolilab or Loko GPS Tracker |
| Google Business Profile | 10 | 0 | Not applicable (no retail presence); not configured for the online business; GBP for the registered address could strengthen entity recognition |
| YouTube channel with topic-relevant content | 20 | 8 | Official channel @nolilab_loko_gps exists; videos present but no confirmed chapters/timestamps; no third-party reviews on YouTube |
| Schema.org structured data | 15 | 9 | Product, Organization, FAQPage, BlogPosting all present; logo format error (string not ImageObject); AggregateRating missing; relative image URLs in BlogPosting |
| Google ecosystem presence | 10 | 0 | No Google Scholar, no Google News inclusion, not in Google Maps |
| Image optimization (alt text, filenames) | 10 | 7 | WebP/AVIF formats ✅; explicit dimensions ✅; fetchpriority on hero ✅; some missing alt text identified in audit |
| E-E-A-T signals (author, about, editorial) | 10 | 5 | Author page exists with topics listed; no About page; no credentials; testimonials present but anonymous |
| Google Merchant Center | 5 | 2 | Product likely not in Google Merchant Center directly (sold via SeeedStudio); SeeedStudio may have its own MC listing |
| Multi-modal content | 5 | 5 | Product photos, technical diagrams, blog images all present ✅ |
| **Total** | **100** | **36** | |

### Gaps for Gemini

**Gap 1 — No Google Knowledge Panel.** A Knowledge Panel is how Gemini identifies a brand as a known, trusted entity. Without it, Gemini treats nolilab.com as an uncategorized website rather than a recognized brand. The Knowledge Panel is created automatically by Google when it has enough structured signals — triggering this requires Wikipedia/Wikidata presence plus consistent sameAs schema markup.

**Gap 2 — YouTube channel exists but is underutilized.** Gemini cites YouTube more than any other AI platform. A product demo video with chapters and timestamps would immediately create a Gemini-citable source for product demonstration queries ("how does Loko GPS tracker work?").

**Gap 3 — Schema logo error suppresses brand display.** The Organization schema uses a plain URL for the logo instead of an ImageObject with dimensions. This prevents Google from displaying the Nolilab logo in branded search results and Knowledge Panel contexts.

**Gap 4 — No AggregateRating on Product schema.** Product star ratings appear in Google Shopping results and influence Gemini's product citation choices. Without review data, the Product schema cannot generate star display.

### Gemini Priority Actions

1. **Fix Organization schema logo format** (plain URL → ImageObject with `@type`, `url`, `width`, `height`). 30-minute fix that enables logo display across all Google properties.
2. **Add YouTube video chapters (timestamps)** to all existing Nolilab YouTube videos. Gemini can reference specific video segments when timestamps are in the description.
3. **Create a Google Business Profile** for Nolilab OÜ at the Tallinn address — even for an online-first business, a GBP entry creates a Google-verified entity record that feeds Gemini's knowledge base.
4. **Pursue the Knowledge Panel** by building Wikidata presence and ensuring sameAs schema links are complete — this is the same action as ChatGPT Priority #1, making it a universal priority.
5. **Submit product to Google Merchant Center** — even if the primary sales channel is SeeedStudio, having the product in Merchant Center enables shopping results and direct Gemini product data access.

---

## Platform 5: Bing Copilot — 38/100 (Weak)

### How Bing Copilot Works (for context)
Copilot uses Bing's index (shared with ChatGPT but different selection logic). It cites fewer sources per answer (3–5) than Perplexity but gives more prominent attribution. Microsoft ecosystem signals — LinkedIn, GitHub, Microsoft documentation — receive extra weight. IndexNow protocol enables near-instant indexing, giving fast content freshness that Copilot values.

### Score Breakdown

| Criterion | Points Available | Score | Evidence |
|---|---|---|---|
| Bing Webmaster Tools verified + sitemap | 15 | 0 | Not confirmed; conservatively 0 |
| IndexNow protocol implemented | 15 | 0 | Confirmed absent (/.well-known/indexnow-key.txt returns 404) |
| Bing index coverage of key pages | 10 | 5 | Site appears in Bing results (Crowd Supply + SeeedStudio pages reference nolilab.com); full coverage unverified |
| LinkedIn company page (complete) | 10 | 5 | Company page exists: 89 followers, 2–10 employees, recent posts (LokoHUB field test, LokoFarm launch); not fully optimized |
| GitHub presence | 5 | 0 | github.com/nolilab occupied by unrelated account; no official Nolilab org confirmed |
| Meta descriptions optimized | 10 | 8 | All analyzed pages have meta descriptions; well-crafted and keyword-rich |
| Social media engagement signals | 10 | 4 | Active on LinkedIn, Instagram, YouTube, Twitter/X; low follower counts; limited engagement data |
| Exact-match keywords in titles/headings | 10 | 8 | "Loko GPS Tracker" appears prominently in titles; "offline GPS tracker," "LoRa P2P" in headings; well-optimized for target terms |
| Page load speed < 2 seconds | 10 | 10 | TTFB 0.32–0.59s across all tested pages ✅ (HTML only; full page load with assets estimated < 2s given static site) |
| Bing Places configured | 5 | N/A | Not a local business |
| **Total** | **100** | **40 → 38*** | *Adjusted to account for GitHub namespace issue severity |

### Gaps for Bing Copilot

**Gap 1 — IndexNow not implemented.** This is a 30-minute fix that directly improves Bing's ability to discover new and updated Nolilab content in real-time. Without IndexNow, new blog posts and product updates may take days or weeks to appear in Bing's index — and therefore in Copilot's answers.

**Gap 2 — Bing Webmaster Tools not configured.** Without Bing WMT, there is no visibility into crawl errors, index status, or keyword performance on Bing. For a site where ChatGPT + Copilot both rely on Bing's index, this is a significant blind spot.

**Gap 3 — GitHub namespace occupied.** Bing Copilot (formerly GitHub Copilot's sibling) has structural affinity for GitHub-present brands. The github.com/nolilab namespace is occupied by an unrelated personal account. Nolilab's open-source firmware, if published under an official organization, would generate GitHub-indexed citable content for Copilot.

**Gap 4 — LinkedIn page not fully optimized.** 89 followers is low for a company that has sold hardware through Crowd Supply (55 backers) and SeeedStudio globally. The LinkedIn page should have a full product showcase, regular posts about LoRa technology, and employee connections to increase its authority signal.

### Bing Copilot Priority Actions

1. **Implement IndexNow** — generate a key at indexnow.org, place the key file at `https://nolilab.com/[key].txt`, and ping the IndexNow API on every content publish. 30-minute setup. ChatGPT and Copilot immediately benefit.
2. **Register in Bing Webmaster Tools** — submit the sitemap, verify ownership, and review the index coverage and keyword reports.
3. **Claim github.com/nolilab-iot** or contact GitHub about the nolilab namespace. Publish firmware and hardware schematics under the official organization. A pinned README linking to the commercial product would be indexed by Bing within days.
4. **LinkedIn content strategy** — the founder (Akio Sato, based on contact email akio@nolilab.com) should post 1–2 times per week on LoRa technology, GPS tracking use cases, and Nolilab engineering insights. Bing has historically weighted social signals more than Google. LinkedIn content is fully indexed by Bing.

---

## Cross-Platform Gap Analysis

### Universal Gaps (affect ALL 5 platforms)

| Gap | Platforms Affected | Priority | Estimated Effort |
|---|---|---|---|
| No Wikipedia article | All 5 (Wikipedia cited by both ChatGPT and Perplexity directly) | Critical | 4–8 weeks (requires press coverage first) |
| No Wikidata entity | All 5 (feeds Google Knowledge Graph + ChatGPT entity data) | Critical | 1–2 hours (can be done today) |
| Spec conflict: Hackaday/Hackster show old specs (12g, 15km) | All 5 (AI systems will cite wrong specs) | Critical | 1 hour outreach to editors |
| No Reddit presence | ChatGPT, Perplexity (heavy), Gemini (moderate) | High | 2–4 hours per post |
| No field test data published | All 5 (primary data preferred over secondary) | High | 3–5 days of work |
| Author credentials not displayed | All 5 (E-E-A-T signal) | High | 1 hour |
| Organization schema logo format error | Gemini (most affected), Google AIO | Medium | 30 minutes |

### Platform-Specific Priorities

| Priority | Google AIO | ChatGPT | Perplexity | Gemini | Bing Copilot |
|---|---|---|---|---|---|
| #1 | Fix truncated FAQ answers | Wikidata entity | Reddit post (r/LoRa) | Fix schema logo | Implement IndexNow |
| #2 | Contact Hackaday/Hackster to update specs | Contact editors to fix specs | Original range test article | YouTube chapters | Register Bing WMT |
| #3 | Add dates to pillar pages | Register Bing WMT | Update Hackaday.io project | Google Business Profile | GitHub organization |
| #4 | Add external citations to homepage stats | Reddit presence | YouTube demo video | AggregateRating schema | LinkedIn content strategy |

---

## Prioritized Action Plan

### Quick Wins (This Week)
*High impact, implementable without new content creation*

| # | Action | Impact | Effort | Platforms |
|---|---|---|---|---|
| 1 | **Create Wikidata entity** for Nolilab OÜ (company type, founding date, Tallinn location, CEO/founder, website, product, sameAs links to LinkedIn/GitHub/Twitter) | High | 1–2 hrs | All 5 platforms — entity recognition improvement |
| 2 | **Contact Tyler August (Hackaday) + Hackster.io editors** to update spec data in published articles (12g → 14g; 10–15km → 20km; 30×23mm → 28.5×20.5×5.9mm) | Critical | 1 hr | All 5 — stops incorrect spec propagation |
| 3 | **Implement IndexNow** (key file + API ping on content update) | Medium | 30 min | Bing Copilot, ChatGPT |
| 4 | **Register in Bing Webmaster Tools** + submit sitemap | Medium | 30 min | ChatGPT, Bing Copilot |
| 5 | **Fix Organization schema logo** (string → ImageObject with dimensions) | Medium | 30 min | Gemini, Google AIO, Bing |
| 6 | **Add YouTube video chapters/timestamps** to all existing videos on @nolilab_loko_gps | Medium | 1 hr | Gemini (primary), Perplexity |
| 7 | **Update Hackaday.io project #166619** with current specs + link to SeeedStudio listing | Medium | 30 min | Perplexity, ChatGPT via Bing |
| 8 | **Complete the "How does Loko work?" FAQ answer** (add Ground Unit + app display explanation) | Medium | 20 min | Google AIO |

**Estimated quick-win score impact:** Google AIO +5, ChatGPT +4, Perplexity +3, Gemini +5, Bing +8

---

### Medium-Term (This Month)
*Significant impact, requires content creation or technical configuration*

| # | Action | Impact | Effort | Platforms |
|---|---|---|---|---|
| 1 | **Post on r/LoRa and r/GPS** — "I made an open-source LoRa GPS tracker, 20km range, no subscription" with demo video (transparent creator disclosure) | High | 2–4 hrs | Perplexity (critical), ChatGPT, Bing Copilot |
| 2 | **Create Google Business Profile** for Nolilab OÜ at the Tallinn address | High | 1 hr | Gemini (critical), Google AIO |
| 3 | **Claim/create GitHub organization** (nolilab-iot or similar) + publish open-source firmware + create README with product links | High | 2–4 hrs | Bing Copilot, ChatGPT, Perplexity |
| 4 | **Create Trustpilot profile** + email SeeedStudio purchasers requesting verified reviews | High | 2 hrs setup | All platforms — social proof for entity validation |
| 5 | **Publish YouTube demo video**: "Loko GPS Tracker: 20km LoRa range test — outdoor demo" with full description, chapters, and auto-captions | High | 1–2 days | Gemini (primary), Perplexity, ChatGPT |
| 6 | **Optimize LinkedIn company page** — complete all fields, add product showcase, begin 2x/week posting by founder on LoRa + GPS topics | Medium | 2 hrs setup + ongoing | Bing Copilot, ChatGPT (via Bing) |
| 7 | **Add dates and "Last reviewed" notices** to all pillar pages (/gps/, /lorawan/, /specifications/, /software/) | Medium | 30 min | Google AIO, Perplexity |
| 8 | **Add externally-cited statistics** (LoRa Alliance data, IEEE papers, FCC frequency docs) to homepage and blog posts | Medium | 2–3 hrs | Google AIO, ChatGPT |

**Estimated monthly-work score impact:** Google AIO +10, ChatGPT +12, Perplexity +20, Gemini +15, Bing +15

---

### Strategic (This Quarter)
*Long-term competitive advantage requiring sustained effort*

| # | Action | Impact | Effort | Platforms |
|---|---|---|---|---|
| 1 | **Earn Wikipedia article** — use Hackaday editorial (May 2025) + Hackster.io + Crowd Supply campaign as notability sources; draft and submit a neutral, well-cited article about the Loko GPS Tracker or Nolilab OÜ | Critical | 4–8 weeks | ChatGPT (critical), Gemini (critical), Google AIO |
| 2 | **Publish original field research** — "Loko LoRa Range Benchmarks: 12 Terrain Types, Real RSSI Data" with downloadable data, graphs, and methodology | High | 3–5 days field + writing | Perplexity (critical), Google AIO, ChatGPT |
| 3 | **Earn Hackaday.com editorial article** (not just a contest entry) — pitch a technical deep-dive: "How We Built the World's Smallest LoRa GPS Tracker: Engineering Decisions and Range Test Data" | High | 2–4 weeks | Perplexity, ChatGPT, Bing Copilot |
| 4 | **YouTube content strategy** — 4 videos/month: range tests, use case demos, firmware tutorials, LoRa technology explainers | High | Ongoing | Gemini (critical), Perplexity, Google AIO |
| 5 | **Engage LoRa Alliance** — apply for membership or request listing in the LoRa Alliance member directory | Medium | 2–4 weeks | All platforms (entity validation) |
| 6 | **lokofarm.com integration** — ensure the secondary domain links back to nolilab.com and shares entity signals; add sameAs linking between the two properties in schema | Medium | 1–2 hrs | Gemini, Google AIO |
| 7 | **Launch affiliate/referral content** on Hackaday.io, Instructables, and Hackster.io as project tutorials | Medium | 1–2 days each | Perplexity, ChatGPT |
| 8 | **Crowd Supply: add updated specs to campaign page** (currently shows old specs that conflict with current product) | Medium | 1 hr | ChatGPT (via Bing), Perplexity |

---

## Projected Score Improvements

| Platform | Current | After Quick Wins | After Monthly Work | After Strategic Quarter |
|---|---|---|---|---|
| Google AI Overviews | 58/100 | 63/100 | 73/100 | 80/100 |
| ChatGPT Web Search | 22/100 | 26/100 | 38/100 | 62/100 |
| Perplexity AI | 30/100 | 33/100 | 53/100 | 68/100 |
| Google Gemini | 36/100 | 41/100 | 56/100 | 72/100 |
| Bing Copilot | 38/100 | 46/100 | 61/100 | 70/100 |
| **Average** | **37/100** | **42/100** | **56/100** | **70/100** |

The path from Weak (37) to Strong (70+) is achievable in one quarter. The most critical milestone is the Wikipedia article — which requires press coverage as a prerequisite, which requires the editorial outreach (Hackaday, Hackster) and original research content as inputs. Wikidata is the immediate unlock that starts the chain.

---

## Appendix: New Brand Presence Identified During This Audit

| Source | URL | Type | Specs Shown | Date |
|---|---|---|---|---|
| Hackaday editorial | hackaday.com/2025/05/22/2025-pet-hacks-contest-loko-tracks-fido-with-lora-and-gps/ | Editorial article | 12g, 15km (**outdated**) | May 22, 2025 |
| Hackster.io editorial | hackster.io/news/dronee-s-loko-is-a-tiny-open-source-lora-asset-tracker-... | Editorial article | 12g, 10km (**outdated**) | Unknown |
| Hackaday.io project | hackaday.io/project/166619/logs | Project page with logs | 2019–present | Active |
| Crowd Supply campaign | crowdsupply.com/nolilab/loko | Funded crowdfunding | 12g, 250 days (**outdated**) | Funded Dec 2022 |
| SeeedStudio product | seeedstudio.com/Loko-GPS-Tracker-p-6261.html | Distributor listing | 14g (**correct**) | Active |
| Antratek | antratek.com/loko-gps-tracker | Distributor listing | Unknown | Active |
| lokofarm.com | lokofarm.com | Nolilab-operated farm domain | N/A | Active |

**Action required on all outdated sources:** Contact each publisher to request spec updates, or publish an authoritative "Product Specifications v2.0" page on nolilab.com that clearly documents what changed and when, so AI systems can identify nolilab.com as the authoritative source for current specs.
