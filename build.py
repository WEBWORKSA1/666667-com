#!/usr/bin/env python3
"""
666667.com static site builder (zero dependencies, Python 3.8+).

  python3 build.py

Reads src/pages/*.html, src/guides/*.html and src/numbers.json, wraps them in the
shared layout, and writes plain .html files to the repo root so GitHub Pages can
serve them directly (no Jekyll, no Actions required).
"""
import json, os, re, html, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
DOMAIN = "https://666667.com"
TODAY = datetime.date.today().isoformat()
INTEREST = "https://web.works/contact"

NAV = [("index.html", "Home"), ("tools.html", "Tools"), ("numbers.html", "Numbers"), ("guides.html", "Guides"),
       ("videos.html", "Videos"), ("domains.html", "Domains")]
MORE = [("contests.html", "Contests & Prizes"), ("donate.html", "Support Us"), ("careers.html", "Careers & Talent"),
        ("advertise.html", "Advertise & Sponsor"), ("about.html", "About"), ("contact.html", "Contact")]

LOGO = ('<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="10" fill="#c8102e"/>'
        '<text x="20" y="27" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="17" fill="#fff">6</text>'
        '<path d="M28 9l3 3-3 3" stroke="#f2c14e" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>')


BASE = """<script>document.write('<base href="'+(location.hostname.slice(-10)==='github.io'?'/666667-com/':'/')+'">')</script>\n"""


def head(meta, root, path):
    title = meta["title"]
    desc = meta["desc"]
    canon = DOMAIN + "/" + ("" if path == "index.html" else path)
    schema = [{
        "@context": "https://schema.org", "@type": "WebSite", "name": "666667", "url": DOMAIN + "/",
        "description": "Chinese lucky numbers, number slang and free lucky-number tools.",
    }, {
        "@context": "https://schema.org", "@type": "Organization", "name": "666667", "url": DOMAIN + "/",
        "logo": DOMAIN + "/assets/img/logo.svg",
    }]
    if meta.get("crumbs"):
        schema.append({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": n, "item": DOMAIN + "/" + u} for i, (u, n) in enumerate(meta["crumbs"])]})
    schema += meta.get("schema", [])
    ld = "\n".join('<script type="application/ld+json">%s</script>' % json.dumps(s, ensure_ascii=False) for s in schema)
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
{BASE if path == "404.html" else ""}<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{canon}">
<meta name="robots" content="{meta.get('robots', 'index,follow,max-image-preview:large')}">
<meta name="theme-color" content="#c8102e">
<meta property="og:type" content="{meta.get('ogtype', 'website')}">
<meta property="og:site_name" content="666667">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{DOMAIN}/assets/img/og.svg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{root}assets/img/logo.svg" type="image/svg+xml">
<link rel="manifest" href="{root}site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{root}assets/css/style.css">
<script>try{{var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t)}}catch(e){{}}</script>
{ld}
</head>"""


def header(root, active):
    cur = lambda u: ' aria-current="page"' if u == active else ""
    items = "".join(f'<li><a href="{root}{u}"{cur(u)}>{n}</a></li>' for u, n in NAV)
    more = "".join(f'<li><a href="{root}{u}"{cur(u)}>{n}</a></li>' for u, n in MORE)
    return f"""<body data-root="{root}">
<a class="skip" href="#main">Skip to content</a>
<div class="topbar" role="note">Contact, if you are interested in this <a href="{INTEREST}" target="_blank" rel="noopener">website / domain name / Sponsorship / Advertisement / Partnership</a> →</div>
<header class="site-header">
  <div class="container nav">
    <a class="brand" href="{root}index.html" aria-label="666667 home">{LOGO}<span>66666<b>7</b></span></a>
    <button class="icon-btn burger" aria-label="Open menu" aria-expanded="false">☰</button>
    <ul class="menu">
      {items}
      <li class="has-sub"><button class="linkish" aria-expanded="false" aria-haspopup="true">More ▾</button><ul class="sub">{more}</ul></li>
      <li><a class="btn btn-primary btn-sm" style="color:#fff" href="{root}services.html#audit">Free Audit</a></li>
      <li><button class="icon-btn theme" aria-label="Toggle dark mode" title="Toggle dark mode">◐</button></li>
    </ul>
  </div>
</header>
<main id="main">"""


def footer(root, tools=False):
    return f"""</main>
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <a class="brand" href="{root}index.html" style="color:#fff">{LOGO}<span>66666<b>7</b></span></a>
        <p style="margin-top:12px">六六六六六七 — “smooth, smooth, smooth… and rise.” The friendly global guide to Chinese lucky numbers, number slang and number-smart business.</p>
        <form data-form="Newsletter" data-ok="You're in! Watch your inbox for the Number of the Week." novalidate>
          <label class="sr" for="nl-email">Email</label>
          <div class="row"><input id="nl-email" name="email" type="email" required placeholder="Your email — Number of the Week"><button class="btn btn-gold btn-sm" type="submit">Subscribe</button></div>
          <div class="hp"><input name="_honey" tabindex="-1" autocomplete="off"></div>
          <p class="form-status small" aria-live="polite"></p>
        </form>
      </div>
      <div><h4>Explore</h4><ul><li><a href="{root}tools.html">Free Tools</a></li><li><a href="{root}numbers.html">Number Dictionary</a></li><li><a href="{root}guides.html">Guides</a></li><li><a href="{root}videos.html">Videos</a></li><li><a href="{root}domains.html">Numeric Domains</a></li></ul></div>
      <div><h4>Work with us</h4><ul><li><a href="{root}services.html#audit">Free Business Audit</a></li><li><a href="{root}advertise.html">Advertise / Sponsor</a></li><li><a href="{root}careers.html">Careers &amp; Talent</a></li><li><a href="{root}contests.html">Contests &amp; Prizes</a></li><li><a href="{root}donate.html">Support Us</a></li></ul></div>
      <div><h4>Company</h4><ul><li><a href="{root}about.html">About</a></li><li><a href="{root}contact.html">Contact</a></li><li><a href="{INTEREST}" target="_blank" rel="noopener">Buy / partner on this domain</a></li></ul></div>
      <div><h4>Legal</h4><ul><li><a href="{root}legal.html#trademark">Trademark &amp; Copyright</a></li><li><a href="{root}privacy.html">Privacy Policy</a></li><li><a href="{root}terms.html">Terms of Use</a></li><li><a href="{root}legal.html#disclaimer">Disclaimer</a></li><li><a href="{root}legal.html#ads">Ads &amp; Affiliate Disclosure</a></li></ul></div>
    </div>
    <div class="legal-note">
      <p><b>Trademark &amp; copyright notice:</b> “666667” is used on this website solely as a descriptive domain name and numeral. No claim of exclusive rights is made in the number itself, and this site is not affiliated with, endorsed by, or connected to any company, product, app, lottery, or organisation that may use the same or a similar number. All third-party names, logos and videos belong to their respective owners and are used for identification, commentary or embedding under the owners' platform terms. Original text, tools and design © <span data-year></span> 666667.com. All rights reserved.</p>
      <p>Cultural content is for education and entertainment. Lucky scores and value estimates are not financial, legal, or investment advice. This site may show ads and earn from affiliate links.</p>
    </div>
  </div>
</footer>
<a class="btn btn-primary btn-block sticky-cta" href="{root}services.html#audit">Free China-market number audit →</a>
<aside class="slidein" aria-label="Free cheat sheet">
  <button class="x" aria-label="Close">×</button>
  <span class="eyebrow">Free cheat sheet</span>
  <h3 style="margin-bottom:6px">50 lucky &amp; unlucky numbers for business</h3>
  <p class="small muted">Prices, phone numbers, floors, gift amounts — the one-page guide used by marketers selling to Chinese-speaking customers.</p>
  <form data-form="Lead magnet - cheat sheet" data-ok="Sent! Check your inbox within 24 hours." novalidate>
    <label class="sr" for="lm-email">Email</label>
    <input id="lm-email" name="email" type="email" required placeholder="you@company.com" style="margin-bottom:8px">
    <input type="hidden" name="lead_magnet" value="50 lucky numbers cheat sheet">
    <div class="hp"><input name="_honey" tabindex="-1" autocomplete="off"></div>
    <button class="btn btn-primary btn-block" type="submit">Email me the cheat sheet</button>
    <p class="form-status small" aria-live="polite"></p>
  </form>
</aside>
<div class="cookie" role="dialog" aria-label="Cookie notice">
  <p style="margin:0 0 10px">We use cookies for analytics and, where enabled, ads (Google AdSense) to keep this site free. See our <a href="{root}privacy.html">Privacy Policy</a>.</p>
  <div class="row"><button class="btn btn-primary btn-sm" data-v="all">Accept</button><button class="btn btn-ghost btn-sm" data-v="essential">Essential only</button></div>
</div>
<script src="{root}assets/js/config.js"></script>
<script src="{root}assets/js/data.js"></script>
<script src="{root}assets/js/app.js" defer></script>
{f'<script src="{root}assets/js/tools.js" defer></script>' if tools else ''}
</body>
</html>
"""


def ad(slot="inContent"):
    return f'<div class="ad-slot container" data-slot="{slot}" aria-label="Advertisement">Advertisement</div>'


def render(path, meta, body):
    depth = path.count("/")
    root = "../" * depth
    body = body.replace("{{ROOT}}", root).replace("{{AD}}", ad()).replace("{{AD_TOP}}", ad("header")).replace("{{AD_SIDE}}", ad("sidebar")).replace("{{UPDATED}}", TODAY)
    out = head(meta, root, path) + "\n" + header(root, meta.get("active", path)) + "\n" + body + "\n" + footer(root, meta.get("tools", False))
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(out)
    return path


def read_src(fp):
    txt = open(fp, encoding="utf-8").read()
    m = re.match(r"\s*<!--META\s*(\{.*?\})\s*-->", txt, re.S)
    meta = json.loads(m.group(1)) if m else {}
    return meta, txt[m.end():] if m else txt


def number_page(x, allnums):
    by = {n["n"]: n for n in allnums}
    verdict = {"lucky": "good", "unlucky": "bad"}.get(x["v"], "")
    rel = "".join(f'<a class="numcard{" neg" if by[r]["s"] < 0 else ""}" href="{r}.html"><b>{r}</b><span class="zh">{by[r]["zh"]}</span><div class="small muted">{html.escape(by[r]["short"])}</div></a>' for r in x["rel"] if r in by)
    faq = [
        (f"What does {x['n']} mean in Chinese?", f"{x['n']} ({x['zh']}, {x['py']}) is associated with {x['sounds']}. {x['short']}."),
        (f"Is {x['n']} a lucky number?", {"lucky": f"Yes. {x['n']} is generally considered lucky in Chinese culture.",
                                          "unlucky": f"No. {x['n']} is generally considered unlucky or offensive and is best avoided.",
                                          "mixed": f"It depends on context. {x['n']} has both positive and negative readings.",
                                          "slang": f"{x['n']} is mainly internet slang rather than a luck number.",
                                          "neutral": f"{x['n']} is broadly neutral."}[x["v"]]),
        (f"How should businesses use {x['n']}?", x["use"]),
    ]
    schema = [{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]},
        {"@context": "https://schema.org", "@type": "DefinedTerm", "name": x["n"], "alternateName": x["zh"], "description": x["short"],
         "inDefinedTermSet": DOMAIN + "/numbers.html"}]
    body = f"""
<section style="padding-top:36px">
<div class="container article">
  <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="../index.html">Home</a> › <a href="../numbers.html">Numbers</a> › {x['n']}</nav>
  <span class="eyebrow">Chinese number meaning</span>
  <h1><span class="num" style="color:var(--red)">{x['n']}</span> <span class="zh">{x['zh']}</span> — {html.escape(x['short'])}</h1>
  <p class="byline">By the 666667 Editorial Team · Updated {TODAY} · <a href="#" data-share>Share</a></p>
  <div class="quick"><b>Quick answer:</b> {x['n']} is read <b>{x['py']}</b> and associated with <b>{html.escape(x['sounds'])}</b>. Verdict: <span class="tag {verdict}">{x['v']}</span></div>
  <div class="table-wrap"><table>
    <tr><th>Number</th><td class="num">{x['n']}</td></tr><tr><th>Chinese</th><td class="zh">{x['zh']}</td></tr>
    <tr><th>Pinyin</th><td>{x['py']}</td></tr><tr><th>Sounds like / means</th><td>{html.escape(x['sounds'])}</td></tr>
    <tr><th>Luck rating</th><td>{x['v'].title()} ({'+' if x['s'] > 0 else ''}{x['s']})</td></tr></table></div>
  <h2>Meaning and origin</h2>
  <p>{html.escape(x['body'])}</p>
  {ad()}
  <h2>How it's used</h2>
  <p>{html.escape(x['use'])}</p>
  <div class="tool" data-checker data-autoload style="margin:24px 0">
    <h3>Check any number that contains {x['n']}</h3>
    <form class="row"><label class="sr" for="c-{x['n']}">Number</label><input id="c-{x['n']}" class="big-input" inputmode="numeric" maxlength="40" value="{x['n']}" placeholder="Enter any number"><button class="btn btn-primary" type="submit">Get lucky score</button></form>
    <div class="result" aria-live="polite"></div>
  </div>
  <h2>FAQ</h2>
  {''.join(f'<details><summary>{html.escape(q)}</summary><p>{html.escape(a)}</p></details>' for q, a in faq)}
  <div class="cta-band" style="margin:36px 0">
    <div><h2>Selling to Chinese-speaking customers?</h2><p>We'll review your prices, phone numbers, address and brand name for lucky and unlucky numbers — free, within 48 hours.</p></div>
    <div><a class="btn btn-gold btn-block" href="../services.html?type=business#audit">Get my free audit</a></div>
  </div>
  <h2>Related numbers</h2>
  <div class="numgrid">{rel}</div>
</div>
</section>"""
    meta = {"title": f"{x['n']} Meaning in Chinese ({x['zh']}, {x['py']}) — Lucky or Not? | 666667",
            "desc": f"What does {x['n']} mean in Chinese? {x['short']}. Pronunciation, origin, usage, FAQs and a free lucky-number checker.",
            "active": "numbers.html", "tools": True, "ogtype": "article", "schema": schema,
            "crumbs": [("", "Home"), ("numbers.html", "Numbers"), (f"numbers/{x['n']}.html", x["n"])]}
    return render(f"numbers/{x['n']}.html", meta, body)


def main():
    nums = json.load(open(os.path.join(ROOT, "src/numbers.json"), encoding="utf-8"))
    os.makedirs(os.path.join(ROOT, "assets/js"), exist_ok=True)
    with open(os.path.join(ROOT, "assets/js/data.js"), "w", encoding="utf-8") as f:
        f.write("/* generated by build.py from src/numbers.json */\nwindow.NUMS=" + json.dumps(nums, ensure_ascii=False) + ";\n")
    built = []
    # number cards snippet for pages
    cards = "".join(
        f'<a class="numcard{" neg" if x["s"] < 0 else ""}" href="{{{{ROOT}}}}numbers/{x["n"]}.html" data-search="{x["n"]} {x["zh"]} {x["py"]} {html.escape(x["short"])} {html.escape(x["sounds"])}" data-v="{x["v"]}" data-cat="{x["cat"]}"><b>{x["n"]}</b><span class="zh">{x["zh"]}</span><div class="small muted">{html.escape(x["short"])}</div></a>'
        for x in nums)
    digits = "".join(
        f'<a class="numcard{" neg" if x["s"] < 0 else ""}" href="{{{{ROOT}}}}numbers/{x["n"]}.html"><b>{x["n"]}</b><span class="zh">{x["zh"]} · {x["py"]}</span><div class="small muted">{html.escape(x["short"])}</div></a>'
        for x in nums if x["cat"] == "digit")
    table = "".join(
        f'<tr><td class="num"><a href="{{{{ROOT}}}}numbers/{x["n"]}.html"><b>{x["n"]}</b></a></td><td class="zh">{x["zh"]}</td><td>{x["py"]}</td><td>{html.escape(x["sounds"])}</td><td><span class="tag {"good" if x["s"] > 0 else "bad" if x["s"] < 0 else ""}">{x["v"]}</span></td></tr>'
        for x in nums)
    guides = []
    for fn in sorted(os.listdir(os.path.join(ROOT, "src/guides"))):
        meta, body = read_src(os.path.join(ROOT, "src/guides", fn))
        slug = fn[:-5]
        meta.setdefault("active", "guides.html")
        meta["ogtype"] = "article"
        meta.setdefault("crumbs", [("", "Home"), ("guides.html", "Guides"), (f"guides/{slug}.html", meta["h1"])])
        meta.setdefault("schema", []).append({"@context": "https://schema.org", "@type": "Article", "headline": meta["h1"],
                                              "description": meta["desc"], "dateModified": TODAY, "author": {"@type": "Organization", "name": "666667 Editorial Team"},
                                              "publisher": {"@type": "Organization", "name": "666667"}})
        wrapped = f"""<section style="padding-top:36px"><div class="container article">
<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="../index.html">Home</a> › <a href="../guides.html">Guides</a> › {html.escape(meta['h1'])}</nav>
<span class="eyebrow">{meta.get('kicker', 'Guide')}</span><h1>{meta['h1']}</h1>
<p class="byline">By the 666667 Editorial Team · Updated {TODAY} · {meta.get('mins', 6)} min read · <a href="#" data-share>Share</a></p>
{body}
<div class="cta-band" style="margin:40px 0"><div><h2>Turn numbers into revenue</h2><p>Get a free review of your prices, phone numbers, brand name and launch date for Chinese-speaking markets.</p></div><div><a class="btn btn-gold btn-block" href="../services.html?type=business#audit">Request free audit</a></div></div>
</div></section>"""
        built.append(render(f"guides/{slug}.html", meta, wrapped))
        guides.append((slug, meta))
    gcards = "".join(
        f'<a class="card card-link" href="{{{{ROOT}}}}guides/{s}.html"><span class="tag">{m.get("kicker", "Guide")}</span><h3 style="margin-top:10px">{m["h1"]}</h3><p class="muted small">{html.escape(m["desc"])}</p><span class="small">{m.get("mins", 6)} min read →</span></a>'
        for s, m in guides)
    for fn in sorted(os.listdir(os.path.join(ROOT, "src/pages"))):
        meta, body = read_src(os.path.join(ROOT, "src/pages", fn))
        body = body.replace("{{NUMCARDS}}", cards).replace("{{DIGITCARDS}}", digits).replace("{{NUMTABLE}}", table).replace("{{GUIDECARDS}}", gcards)
        meta.setdefault("active", fn)
        built.append(render(fn, meta, body))
    for x in nums:
        built.append(number_page(x, nums))
    # sitemap
    urls = [u for u in built if u != "404.html"]
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u in sorted(urls):
        loc = DOMAIN + "/" + ("" if u == "index.html" else u)
        pr = "1.0" if u == "index.html" else "0.8" if "/" not in u else "0.6"
        sm.append(f"  <url><loc>{loc}</loc><lastmod>{TODAY}</lastmod><priority>{pr}</priority></url>")
    sm.append("</urlset>")
    open(os.path.join(ROOT, "sitemap.xml"), "w").write("\n".join(sm) + "\n")
    print(f"Built {len(built)} pages")


if __name__ == "__main__":
    main()
