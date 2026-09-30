# 666667.com

A static website about Chinese lucky numbers, number slang and number-smart business. It includes 5 interactive tools, 40 number pages, 7 guides, lead-generation funnels, donations, contests, careers, and advertising and sponsorship pages.

- **Live (GitHub Pages):** https://webworksa1.github.io/666667-com/
- **Strategy and research:** [RESEARCH.md](RESEARCH.md)
- **Phase-wise build prompt:** [BUILD-PROMPT.md](BUILD-PROMPT.md)

## Structure
```
_config.yml           Jekyll config (GitHub Pages builds the site automatically)
_layouts/             default, guide and number page layouts
_numbers/*.md         one tiny file per number page (rendered from src/numbers.json)
*.html, guides/*.html page stubs (front matter + include of the page body)
src/pages/*.html      page bodies        src/guides/*.html  guide bodies
src/partials/         shared variables, footer, logo
src/numbers.json      the number dictionary (40 entries)
assets/css/style.css
assets/js/config.js   edit this to go live (AdSense, GA4, form alias, payment links, videos)
assets/js/app.js      nav, theme, forms, ads, videos, donations, countdown
assets/js/tools.js    lucky score, price generator, zodiac, domain valuator, generator
```

## Edit
- To change a page, edit its body in `src/pages/` or `src/guides/`.
- To add a number, add an entry to `src/numbers.json` and a file `_numbers/<number>.md` containing `n: "<number>"` in its front matter.
- Commit, and GitHub Pages rebuilds automatically.

## Go-live checklist
1. **Forms:** submit any form once. The inbox receives a FormSubmit "Activate" email; click it. Optionally paste the random alias FormSubmit gives you into `formAlias` in `config.js`.
2. **Custom domain:** add a file named `CNAME` containing `666667.com`. At your registrar, create A records for `@` pointing to 185.199.108.153, 185.199.109.153, 185.199.110.153 and 185.199.111.153, plus a CNAME `www` pointing to `webworksa1.github.io`. Then go to Settings → Pages → Enforce HTTPS.
3. **AdSense:** once approved, set `adsenseClient` and the slot IDs in `config.js`, and update `ads.txt`.
4. **Payments:** add PayPal, Buy Me a Coffee, Ko-fi or Stripe links in `config.js`. Their buttons appear automatically.
5. **YouTube:** set `youtubeChannel` and replace `videos` with your own video IDs.

## Legal
"666667" is used only as a domain name and descriptive numeral. There is no affiliation with any third party using the same number. See `legal.html`.
