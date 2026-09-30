# 666667.com

A static website about Chinese lucky numbers, number slang and number-smart business. It includes 5 interactive tools, 40 number pages, 7 guides, lead-generation funnels, donations, contests, careers, and advertising and sponsorship pages.

- **Live (GitHub Pages):** https://webworksa1.github.io/666667-com/
- **Strategy and research:** [RESEARCH.md](RESEARCH.md)
- **Phase-wise build prompt:** [BUILD-PROMPT.md](BUILD-PROMPT.md)

## Structure
```
index.html, tools.html, numbers.html, guides.html, videos.html, domains.html,
services.html (lead gen), donate.html, contests.html, careers.html, advertise.html,
about.html, contact.html, legal.html, privacy.html, terms.html, 404.html
numbers/*.html      generated number pages (from src/numbers.json)
guides/*.html       generated guides (from src/guides)
assets/css/style.css
assets/js/config.js   edit this to go live (AdSense, GA4, form alias, payment links, videos)
assets/js/app.js      nav, theme, forms, ads, videos, donations, countdown
assets/js/tools.js    lucky score, price generator, zodiac, domain valuator, generator
build.py              regenerates every page: python3 build.py
```

## Edit and rebuild
Edit `src/pages/*.html`, `src/guides/*.html` or `src/numbers.json`, then commit and push. The **Build site** GitHub Action runs `python3 build.py` and commits the generated pages. You can also run `python3 build.py` locally.

## Go-live checklist
1. **Forms:** submit any form once. The inbox receives a FormSubmit "Activate" email; click it. Optionally paste the random alias FormSubmit gives you into `formAlias` in `config.js`.
2. **Custom domain:** add a file named `CNAME` containing `666667.com`. At your registrar, create A records for `@` pointing to 185.199.108.153, 185.199.109.153, 185.199.110.153 and 185.199.111.153, plus a CNAME `www` pointing to `webworksa1.github.io`. Then go to Settings → Pages → Enforce HTTPS.
3. **AdSense:** once approved, set `adsenseClient` and the slot IDs in `config.js`, and update `ads.txt`.
4. **Payments:** add PayPal, Buy Me a Coffee, Ko-fi or Stripe links in `config.js`. Their buttons appear automatically.
5. **YouTube:** set `youtubeChannel` and replace `videos` with your own video IDs.

## Legal
"666667" is used only as a domain name and descriptive numeral. There is no affiliation with any third party using the same number. See `legal.html`.
