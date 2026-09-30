/* 666667.com — interactive tools (lucky score, price generator, zodiac, domain valuator, generator) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var NUMS = window.NUMS || [];
  var ROOT = document.body.getAttribute("data-root") || "";
  var W = { 0: 1, 1: 1, 2: 2, 3: 1, 4: -4, 5: 0, 6: 3, 7: 1, 8: 4, 9: 3 };
  var WORD = { 0: "whole", 1: "want/first", 2: "pairs", 3: "life", 4: "death (死)", 5: "me / none", 6: "smooth (溜)", 7: "rise (起)", 8: "prosper (发)", 9: "lasting (久)" };
  var combos = NUMS.filter(function (x) { return x.n.length >= 2; }).sort(function (a, b) { return b.n.length - a.n.length; });
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- core scorer ---------- */
  function score(raw, mode) {
    var d = String(raw).replace(/\D/g, "");
    if (!d) return null;
    var sum = 0; for (var i = 0; i < d.length; i++) sum += W[d[i]];
    var avg = sum / d.length, s = 50 + avg * 10, notes = [], found = [];
    combos.forEach(function (c) {
      if (d.indexOf(c.n) > -1 && !found.some(function (f) { return f.n.indexOf(c.n) > -1; })) { found.push(c); s += Math.max(-12, Math.min(12, c.s * 1.2)); }
    });
    if (d.indexOf("4") === -1) { s += 5; notes.push("No 4 (死) anywhere — a big plus for Chinese-speaking buyers."); }
    else { var c4 = d.split("4").length - 1; notes.push("Contains " + c4 + "× digit 4, which sounds like 'death'. Consider swapping it out."); }
    var runs = d.match(/(\d)\1{2,}/g) || [];
    runs.forEach(function (r) { var w = W[r[0]]; if (w > 0) { s += (r.length - 2) * 3; notes.push("Repeating run '" + r + "' — repeated lucky digits are highly prized (AAA / AAAA patterns)."); } else if (w < 0) s -= (r.length - 2) * 4; });
    var last = +d[d.length - 1];
    var endW = (mode === "price" || mode === "phone" || mode === "plate") ? 2.5 : 1.2; s += W[last] * endW;
    if (W[last] >= 3) notes.push("Ends in " + last + " (" + WORD[last] + ") — endings carry extra weight, especially for prices and phone numbers.");
    if (/0123|1234|2345|3456|5678|6789/.test(d)) { s += 3; notes.push("Contains a rising sequence — reads as steady progress (步步高)."); }
    if (mode === "domain") { if (d.length <= 4) s += 8; else if (d.length <= 6) s += 3; else s -= 4; notes.push(d.length + "-digit number: shorter numeric names are rarer and easier to type."); }
    if (mode === "date" && d.length === 8) notes.push("For dates, many families also consult the traditional almanac (黄历) — use this as a numerology check only.");
    s = Math.round(Math.max(0, Math.min(100, s)));
    var tier = s >= 85 ? ["Exceptionally lucky", "大吉", "var(--good)"] : s >= 70 ? ["Very lucky", "吉", "var(--good)"] : s >= 55 ? ["Good", "小吉", "var(--gold)"] : s >= 40 ? ["Neutral", "平", "var(--ink-2)"] : ["Unlucky", "凶", "var(--bad)"];
    return { d: d, s: s, tier: tier, found: found, notes: notes };
  }
  window.luckyScore = score;

  function renderScore(r, box, withCta) {
    if (!r) { box.innerHTML = "<p>Please enter at least one digit.</p>"; box.classList.add("show"); return; }
    var digits = r.d.split("").slice(0, 40).map(function (c) { var w = W[c]; return '<span class="digit ' + (w > 1 ? "pos" : w < 0 ? "neg" : "neu") + '">' + c + "<small>" + WORD[c] + "</small></span>"; }).join("");
    var fc = r.found.length ? '<h4>Meaningful combinations found</h4><ul class="list-plain">' + r.found.map(function (c) {
      return '<li><a href="' + ROOT + "numbers/" + c.n + '.html"><b class="num">' + c.n + '</b></a> <span class="zh">' + c.zh + "</span> — " + esc(c.short) + ' <span class="tag ' + (c.s > 0 ? "good" : c.s < 0 ? "bad" : "") + '">' + c.v + "</span></li>";
    }).join("") + "</ul>" : "";
    var share = location.origin + location.pathname + "?n=" + r.d;
    box.innerHTML = '<div class="gauge"><div class="gauge-ring" style="--p:' + r.s + ";--c:" + r.tier[2] + '"><span>' + r.s + '</span></div><div><div class="small muted">Lucky score for <b class="num">' + esc(r.d.length > 24 ? r.d.slice(0, 24) + "…" : r.d) + '</b></div><div style="font-size:1.5rem;font-weight:800;color:' + r.tier[2] + '">' + r.tier[0] + ' <span class="zh">' + r.tier[1] + "</span></div>" +
      '<div class="row" style="margin-top:8px"><button class="btn btn-ghost btn-sm" data-share data-url="' + share + '" type="button">Share result</button></div></div></div>' +
      '<div class="digits" aria-label="Digit breakdown">' + digits + "</div>" + fc +
      '<h4>What it means</h4><ul>' + r.notes.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") + "</ul>" +
      (withCta ? '<div class="quick"><b>Using this number for a business, price list or brand?</b> Get a free human review of your numbers, prices and name for Chinese-speaking customers. <a href="' + ROOT + 'services.html?type=business#audit">Request a free audit →</a></div>' : "");
    box.classList.add("show");
    $$("[data-share]", box).forEach(function (b) { b.addEventListener("click", function () {
      if (navigator.share) navigator.share({ title: "My lucky score: " + r.s + "/100", url: share }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(share).then(function () { window.toast && toast("Link copied!"); });
    }); });
    if (window.gtag) gtag("event", "tool_use", { tool: "lucky_checker", score: r.s });
  }

  /* ---------- checker widgets ---------- */
  $$("[data-checker]").forEach(function (w) {
    var inp = $("input", w), out = $(".result", w), mode = "general";
    $$(".segmented button", w).forEach(function (b) { b.addEventListener("click", function () {
      mode = b.getAttribute("data-mode"); $$(".segmented button", w).forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      inp.placeholder = b.getAttribute("data-ph") || "Enter any number"; inp.type = mode === "date" ? "date" : "text"; inp.value = "";
    }); });
    function run() { renderScore(score(inp.value, mode), out, true); }
    $("form", w).addEventListener("submit", function (e) { e.preventDefault(); run(); });
    $$(".chip[data-try]", w).forEach(function (c) { c.addEventListener("click", function () { if (inp.type === "date") return; inp.value = c.getAttribute("data-try"); run(); }); });
    var q = new URLSearchParams(location.search).get("n");
    if (q && w.hasAttribute("data-autoload")) { inp.value = q.replace(/\D/g, "").slice(0, 40); run(); }
  });

  /* ---------- lucky price generator ---------- */
  var pf = $("#price-form");
  if (pf) pf.addEventListener("submit", function (e) {
    e.preventDefault();
    var p = parseFloat($("#price-in").value), out = $("#price-out");
    if (!(p > 0)) { out.innerHTML = "<p>Enter a price above zero.</p>"; out.classList.add("show"); return; }
    var P = Math.round(p), cands = {}, pats = ["8", "6", "9", "88", "68", "98", "66", "99", "18", "28", "168", "888", "688", "988", "666", "999", "518"];
    pats.forEach(function (pt) {
      var k = pt.length, m = Math.pow(10, k), base = Math.floor(P / m) * m;
      [base - m, base, base + m].forEach(function (b) { var c = b + +pt; if (c > 0 && String(c).indexOf("4") === -1 && Math.abs(c - P) / P <= 0.2) cands[c] = 1; });
    });
    if (P < 10) [6, 8, 9].forEach(function (c) { cands[c] = 1; });
    var list = Object.keys(cands).map(Number).map(function (c) { return { c: c, r: score(c, "price") }; })
      .sort(function (a, b) { return b.r.s - a.r.s || Math.abs(a.c - P) - Math.abs(b.c - P); }).slice(0, 8);
    var cur = $("#price-cur").value;
    out.innerHTML = '<div class="table-wrap"><table><thead><tr><th>Suggested price</th><th>Change</th><th>Score</th><th>Why</th></tr></thead><tbody>' + list.map(function (x) {
      var diff = x.c - P, pct = (diff / P * 100).toFixed(1);
      return "<tr><td class='num'><b>" + cur + " " + x.c.toLocaleString() + "</b></td><td class='num'>" + (diff >= 0 ? "+" : "") + diff.toLocaleString() + " (" + pct + "%)</td><td class='num'>" + x.r.s + "</td><td class='small'>" + (x.r.found[0] ? x.r.found[0].n + " = " + esc(x.r.found[0].short) : "Ends in " + String(x.c).slice(-1) + " (" + WORD[String(x.c).slice(-1)] + ")") + "</td></tr>";
    }).join("") + "</tbody></table></div>" +
      (String(P).indexOf("4") > -1 ? '<p class="quick">Your original price contains a <b>4</b>. For Chinese-speaking shoppers that is the first thing to change.</p>' : "") +
      '<p class="small muted">Original score: <b>' + score(P, "price").s + "</b>/100. Scores are cultural heuristics, not financial advice. <a href='" + ROOT + "services.html?type=business#audit'>Get your whole price list reviewed →</a></p>";
    out.classList.add("show");
  });

  /* ---------- zodiac ---------- */
  var Z = [["Rat", "鼠", "🐀", [2, 3], "Clever, resourceful, quick-witted"], ["Ox", "牛", "🐂", [1, 4], "Diligent, dependable, determined"], ["Tiger", "虎", "🐅", [1, 3, 4], "Brave, confident, competitive"], ["Rabbit", "兔", "🐇", [3, 4, 6], "Gentle, elegant, responsible"], ["Dragon", "龙", "🐉", [1, 6, 7], "Confident, ambitious, charismatic"], ["Snake", "蛇", "🐍", [2, 8, 9], "Wise, intuitive, enigmatic"], ["Horse", "马", "🐎", [2, 3, 7], "Energetic, independent, warm"], ["Goat", "羊", "🐐", [3, 4, 9], "Calm, creative, kind"], ["Monkey", "猴", "🐒", [4, 9], "Sharp, curious, playful"], ["Rooster", "鸡", "🐓", [5, 7, 8], "Observant, hardworking, honest"], ["Dog", "狗", "🐕", [3, 4, 9], "Loyal, honest, protective"], ["Pig", "猪", "🐖", [2, 5, 8], "Generous, diligent, easy-going"]];
  var EL = ["Metal", "Metal", "Water", "Water", "Wood", "Wood", "Fire", "Fire", "Earth", "Earth"];
  var zf = $("#zodiac-form");
  if (zf) zf.addEventListener("submit", function (e) {
    e.preventDefault();
    var y = parseInt($("#zodiac-year").value, 10), out = $("#zodiac-out");
    if (!(y > 1800 && y < 2200)) { out.innerHTML = "<p>Enter a birth year like 1990.</p>"; out.classList.add("show"); return; }
    var z = Z[((y - 1900) % 12 + 12) % 12], el = EL[y % 10];
    out.innerHTML = '<div class="gauge"><div style="font-size:4rem;line-height:1">' + z[2] + '</div><div><div class="small muted">Born in ' + y + '</div><div style="font-size:1.6rem;font-weight:800">' + el + " " + z[0] + ' <span class="zh">' + z[1] + '</span></div><div class="muted">' + z[4] + '</div></div></div>' +
      '<p style="margin-top:12px"><b>Commonly cited lucky numbers:</b> ' + z[3].map(function (n) { return '<a class="chip" href="' + ROOT + "numbers/" + n + '.html">' + n + "</a>"; }).join(" ") + "</p>" +
      '<p class="small muted">Born in January or early February? The zodiac year starts at Chinese New Year (late Jan – mid Feb), so you may belong to the previous sign. Lucky-number lists vary between traditions.</p>';
    out.classList.add("show");
  });

  /* ---------- numeric domain valuator (indicative) ---------- */
  var BAND = { 2: [900000, 3000000], 3: [25000, 150000], 4: [1500, 20000], 5: [150, 2500], 6: [15, 600], 7: [10, 150], 8: [10, 60] };
  var TLD = { com: 1, cn: 0.3, net: 0.2, "com.cn": 0.12, org: 0.12, io: 0.15, co: 0.12, ai: 0.35, other: 0.06 };
  var df = $("#domain-form");
  if (df) df.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = $("#domain-in").value.replace(/\D/g, ""), t = $("#domain-tld").value, out = $("#domain-out");
    if (d.length < 2 || d.length > 12) { out.innerHTML = "<p>Enter 2–12 digits (numbers only).</p>"; out.classList.add("show"); return; }
    var b = BAND[Math.min(d.length, 8)].slice(), m = TLD[t] || 0.06, why = [];
    var chip = !/[04]/.test(d);
    if (/4/.test(d)) { m *= 0.4; why.push("Contains 4 — Chinese buyers discount it heavily (×0.4)."); }
    if (chip && d.length >= 4) { m *= 1.6; why.push("'Chinese premium' digits only (no 0 or 4) — a sought-after class (×1.6)."); }
    if (/^(\d)\1+$/.test(d)) { m *= 4; why.push("All-same digits (AAAA…) — the rarest pattern (×4)."); }
    else if (/^(\d)\1(\d)\2$|^(\d)(\d)\3\4$/.test(d) || /(\d)\1{3,}/.test(d)) { m *= 1.8; why.push("Strong repeating pattern (AABB / ABAB / long run) (×1.8)."); }
    if (d[0] === "0") { m *= 0.6; why.push("Leading zero reduces value (×0.6)."); }
    if (/^[689]/.test(d)) { m *= 1.2; why.push("Starts with 6, 8 or 9 (×1.2)."); }
    var hit = combos.filter(function (c) { return c.s >= 5 && d.indexOf(c.n) > -1; })[0];
    if (hit) { m *= 1.4; why.push("Contains the meaningful combo " + hit.n + " (" + hit.short + ") (×1.4)."); }
    var lo = Math.max(10, Math.round(b[0] * m / 10) * 10), hi = Math.max(lo + 10, Math.round(b[1] * m / 10) * 10);
    var r = score(d, "domain");
    out.innerHTML = '<div class="gauge"><div class="gauge-ring" style="--p:' + r.s + ";--c:" + r.tier[2] + '"><span>' + r.s + '</span></div><div><div class="small muted">' + d + "." + t + ' — indicative wholesale-to-retail range</div><div class="num" style="font-size:1.7rem;font-weight:800">US$' + lo.toLocaleString() + " – " + hi.toLocaleString() + '</div><div class="small muted">Lucky score ' + r.s + "/100 · " + r.tier[0] + "</div></div></div>" +
      "<ul>" + (why.length ? why : ["No special pattern — valued on length and extension."]).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" +
      '<p class="small muted">Heuristic estimate for education only — real prices depend on live comparable sales, traffic, history and buyer demand. Not an appraisal or financial advice.</p>' +
      '<div class="row"><a class="btn btn-primary btn-sm" href="' + ROOT + 'domains.html?type=domain-sell#domain-inquiry">I own it — get a real appraisal</a><a class="btn btn-ghost btn-sm" href="' + ROOT + 'domains.html?type=domain-buy#domain-inquiry">I want to buy one like it</a></div>';
    out.classList.add("show");
  });

  /* ---------- lucky number generator ---------- */
  var gf = $("#gen-form");
  if (gf) gf.addEventListener("submit", function (e) {
    e.preventDefault();
    var len = Math.max(2, Math.min(12, parseInt($("#gen-len").value, 10) || 4)), out = $("#gen-out");
    var pool = "8888888866666699999911223377" + "05";
    var set = {}, tries = 0;
    while (Object.keys(set).length < 30 && tries++ < 500) { var s = ""; for (var i = 0; i < len; i++) s += pool[Math.floor(Math.random() * pool.length)]; if (!(s[0] === "0")) set[s] = 1; }
    var list = Object.keys(set).map(function (s) { return score(s, "phone"); }).sort(function (a, b) { return b.s - a.s; }).slice(0, 10);
    out.innerHTML = '<div class="chips">' + list.map(function (r) { return '<a class="chip" href="' + ROOT + 'tools.html?n=' + r.d + '#checker" title="Score ' + r.s + '">' + r.d + " · " + r.s + "</a>"; }).join("") + "</div>" +
      '<p class="small muted" style="margin-top:10px">Use these as phone-number endings, PINs you share, table numbers or product codes. Click one to see its full breakdown.</p>';
    out.classList.add("show");
  });
})();
