# Phase-wise build prompt for 666667.com

Paste the phases one at a time into an AI coding assistant, or hand them to a developer. Each phase is self-contained and ends with acceptance criteria. This repository is the finished output of Phases 1–7. Phases 8–10 are the growth roadmap.

---

## Global brief (prepend to every phase)

> You are building **666667.com**, a world-class, modern, responsive, interactive static website. It is the global guide to **Chinese lucky numbers, number slang and number-smart business**. The name reads 六六六六六七: five "smooth / awesome" sixes (溜) and a 7 echoing 起 ("rise").
>
> **Hard constraints**
> - Pure static HTML/CSS/vanilla JS with no server, hostable on the **GitHub Pages free plan** from the repo root, using GitHub Pages' built-in Jekyll build (no Actions required). Use relative links so the site works both at `username.github.io/666667-com/` and at a custom domain.
> - On **every page**, the first element must be a top bar reading: "Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership". It links to `https://web.works/contact` in a new tab.
> - **One inbox only** for every form and contact link. The address must **never appear in page text, HTML, or the repo as plain text**. Store it encoded in `assets/js/config.js`, decode it only at submit or click time, and deliver form posts through FormSubmit's AJAX endpoint. Support a `formAlias` so the address can be removed completely after activation. `mailto` links are built on click.
> - Do not use "666667" as a trademark claim. Include a full **trademark & copyright disclosure**, a disclaimer, an ads/affiliate disclosure, a privacy policy and terms. Use no third-party logos or characters.
> - Monetization-ready: **Google AdSense** slots with a clean placeholder until a publisher ID is set, **YouTube** embeds using lightweight click-to-load facades, affiliate disclosure, donations, sponsorships.
> - Performance: no framework and no build step required to serve. Fonts from Google Fonts only. Lighthouse 90+ on mobile.
> - Accessibility: semantic landmarks, labels on every input, visible focus, `prefers-reduced-motion`, light and dark themes.
> - SEO: unique title and description per page, canonical, Open Graph, JSON-LD (WebSite, Organization, FAQPage, Article), `sitemap.xml`, `robots.txt`, `ads.txt`.

---

## Phase 1 — Foundation and design system
**Build:** `assets/css/style.css` with design tokens: auspicious red `#c8102e`, gold `#c9960c`, warm off-white background, ink-black dark mode, green/red for lucky/unlucky.

Typography:

- Inter for body text
- Space Grotesk for numerals
- Noto Sans SC for Chinese

Components:

- buttons, cards, chips
- a segmented control
- gauge ring, digit chips, number grid
- tables, FAQ `<details>`
- multi-step form, choice cards
- CTA band, donation tiers, progress bar, countdown
- ad slot, video facade
- sticky mobile CTA, slide-in, cookie notice, toast

The layout needs a sticky header with a dropdown "More" menu, a mobile burger menu and a theme toggle.

**Acceptance:** 375px width shows no horizontal scroll. The dark mode toggle persists in `localStorage`, with every access wrapped in try/catch.

## Phase 2 — Layout system and data (GitHub Pages Jekyll)
**Build:** `_config.yml` sets `data_dir: src` and `includes_dir: src`.

- `_layouts/default.html` holds the head, the top bar, the header with nav, and the footer. JSON-LD is generated per page type.
- `_layouts/guide.html` and `_layouts/number.html` wrap guides and number pages.
- `src/partials/vars.html` computes the relative `ROOT`, the ad slots, the number cards and table, and the guide cards.
- Each root page is a small stub: front matter (title, description, tools flag), then an include of `src/pages/<name>.html`.
- Each guide is a stub in `/guides/` that includes `src/guides/<name>.html`.
- Number pages are a Jekyll collection (`_numbers/<n>.md`) rendered from `src/numbers.json`, which holds 40 digits, combos and slang terms with these fields: `zh`, `py`, `sounds`, `verdict`, `score`, `category`, short meaning, long body, usage, and related numbers.
- `assets/js/data.js` is rendered from the same data file. `jekyll-sitemap` generates `sitemap.xml`.

**Acceptance:** the GitHub Pages build succeeds, and every internal link resolves.

## Phase 3 — Interactive tools (`assets/js/tools.js`)
1. **Lucky Number Checker.** Modes: any, phone, price, plate, address, domain, date. It computes a transparent 0–100 score:
   - per-digit weights (8 = +4, 6 and 9 = +3, 4 = −4)
   - detection of known combos
   - a bonus for runs of repeated lucky digits and a no-4 bonus
   - extra weight on the last digit for prices, phones and plates

   Output: a gauge, digit chips, combos found with links to their number pages, plain-English notes, a share link (`?n=`) and an audit CTA.
2. **Lucky Price Generator.** Suggests up to 8 prices within ±20% that end in lucky patterns and contain no 4, with the score and the reason for each.
3. **Chinese Zodiac Finder.** Gives the animal and element from the birth year, the commonly cited lucky numbers, and a note about the Chinese New Year boundary.
4. **Numeric Domain Valuator.** Gives an indicative range from length, TLD, 4-penalty, "Chinese premium" digits, patterns, leading digit and meaningful combos. It shows a clear not-an-appraisal disclaimer and CTAs to sell or buy.
5. **Lucky Number Generator.** Produces weighted digits with no 4, ranked by score.

**Acceptance:** 666667 scores 100. Pricing 1450 returns suggestions with no 4. 1988 returns Earth Dragon.

## Phase 4 — Content
- **Home:**
  - hero checker
  - 0–9 digit grid
  - the "Why 666667" story
  - tool cards
  - business audit CTA band
  - videos
  - guides
  - contest, donate and careers teasers
  - FAQ
- **Number dictionary** with search and filters (lucky, unlucky, slang, digits, combos), a quick-reference table, and one page per number with quick answer, table, meaning, usage, embedded checker, FAQ schema, CTA and related numbers.
- **Seven guides:** what 666667 means, complete lucky-numbers guide, lucky pricing playbook, phone numbers and plates, numeric domains in China, number slang, red envelope amounts.

**Acceptance:** every page has a unique title, description, H1, breadcrumbs and at least one internal CTA.

## Phase 5 — Lead generation engine
- `services.html` holds a **3-step qualifying form**:
  1. Inquiry type: business audit, naming, numeric domain, personal, advertise/sponsor, partnership/acquisition. It can be preselected with `?type=`.
  2. Company, website, target market, budget, timeline, details.
  3. Name, email, phone/WhatsApp, WeChat, source, consent.

  Around it: a progress bar, trust row, how-it-works section, packages ($168 / $888 / $1,688+) and FAQ.
- **Domain desk** form (sell, buy, appraise, lease), **media-kit** form, **slide-in lead magnet** (once per session at 45% scroll), **newsletter** in the footer and on the guides page, and a **sticky mobile CTA**.
- All forms include a honeypot, validation, AJAX submit, success and error states, and a mail fallback when the submit fails. A GA4 `generate_lead` event fires when an ID is set.

**Acceptance:** submitting any form sends a structured email with a subject prefix of `[666667.com]`, and the inbox address is never visible.

## Phase 6 — Community and monetization pages
- **Donate:**
  - goal progress bar
  - lucky tiers ($8 / $18 / $88 / $168) and monthly memberships
  - buttons for PayPal, Buy Me a Coffee, Ko-fi and Stripe, which stay hidden until their URLs are configured
  - a pledge form for any payment method (bank, Interac, WeChat Pay, Alipay, UPI, invoice)
  - a use-of-funds table: operations, content, promotions and marketing, hiring, contests and prizes
  - supporter wall
- **Contests:** countdown, prizes, entry form (18+ and rules checkboxes, referral field), skill-based judging criteria and a rules summary. No purchase necessary; void where prohibited; register or file in regions such as Quebec where required.
- **Careers:** six roles and an application form (portfolio, rate, availability).
- **Advertise:** placements, a launch rate card, prohibited categories (gambling, predatory lending) and a media-kit form.
- **Videos:** facade grid driven by `config.videos`, a channel CTA and a creator submission form.

## Phase 7 — Legal, SEO, QA and deployment
- `legal.html` (trademark, copyright, takedown, disclaimer, ads/affiliate), `privacy.html`, `terms.html`, and a playful `404.html` that sets its base path automatically.
- QA:
  - Playwright at 1280px and 375px: no console errors, no overflow, top bar present on every page, email string absent from rendered text and from source
  - internal link checker
- Deploy: push to `main` on GitHub. Pages builds with Jekyll from the root of `main` (or of `gh-pages`).

## Phase 8 — Go-live configuration (owner, about 30 minutes)
1. Submit any form once and click **Activate** in the FormSubmit email. Then paste the alias into `formAlias`.
2. Point the domain: add a `CNAME` file containing `666667.com`, then create DNS A records to 185.199.108.153, .109, .110 and .111 plus a `www` CNAME to `webworksa1.github.io`. Turn on "Enforce HTTPS".
3. Apply to AdSense and set `adsenseClient` and the slot IDs. Replace the `ads.txt` line.
4. Add GA4, Search Console and the sitemap. Add payment links and your YouTube channel and videos.

## Phase 9 — Growth (months 1–6)
- Programmatic SEO: expand to more than 300 number pages (00–99, 000–999 notable numbers, every year 1920–2030 for zodiac, "is my birthday lucky" dates).
- Localisation: Simplified and Traditional Chinese with hreflang, then Vietnamese and Korean.
- Weekly "Number of the Week" email and matching YouTube Shorts.
- An embeddable widget for real-estate and dealer sites, with a backlink engine.
- A downloadable PDF lead magnet; paid "Full Lucky Report" PDFs ($9–$29).

## Phase 10 — Scale
- Headless CMS (Decap or Tina on GitHub) so non-developers can publish.
- Sponsor marketplace, affiliate integrations, member area (ad-free), numeric-domain listings feed.
- Quarterly revenue review of RPM by page type, lead-to-client conversion, and sponsor fill rate.
