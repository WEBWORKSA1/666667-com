/* 666667.com — site runtime (vanilla JS, no dependencies) */
(function () {
  "use strict";
  var S = window.SITE || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    sget: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- inbox (never rendered as text) ---------- */
  function inbox() { return (S._k || []).slice().reverse().map(function (c) { return String.fromCharCode(c - 7); }).join(""); }
  function endpoint() { return "https://formsubmit.co/ajax/" + (S.formAlias || inbox()); }
  $$("[data-mail]").forEach(function (a) {
    a.setAttribute("href", "#contact");
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var subj = a.getAttribute("data-mail") || "Inquiry from 666667.com";
      window.location.href = "mai" + "lto:" + inbox() + "?subject=" + encodeURIComponent(subj);
    });
  });

  /* ---------- toast ---------- */
  function toast(msg) {
    var t = $(".toast"); if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show"); setTimeout(function () { t.classList.remove("show"); }, 2600);
  }
  window.toast = toast;

  /* ---------- theme ---------- */
  var saved = store.get("theme"); if (saved) document.documentElement.setAttribute("data-theme", saved);
  $$(".theme").forEach(function (b) {
    b.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme");
      var dark = cur ? cur === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
      var next = dark ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next); store.set("theme", next);
    });
  });

  /* ---------- nav ---------- */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) burger.addEventListener("click", function () {
    var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o ? "true" : "false");
  });
  $$(".has-sub > button").forEach(function (b) {
    b.addEventListener("click", function () { var p = b.parentNode; var o = p.classList.toggle("open"); b.setAttribute("aria-expanded", o); });
  });

  /* ---------- analytics ---------- */
  if (S.ga4) {
    var g = document.createElement("script"); g.async = true; g.src = "https://www.googletagmanager.com/gtag/js?id=" + S.ga4; document.head.appendChild(g);
    window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); }; gtag("js", new Date()); gtag("config", S.ga4);
  }
  function track(ev, p) { if (window.gtag) gtag("event", ev, p || {}); }

  /* ---------- AdSense ---------- */
  if (S.adsenseClient) {
    var a = document.createElement("script"); a.async = true; a.crossOrigin = "anonymous";
    a.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + S.adsenseClient; document.head.appendChild(a);
    $$(".ad-slot").forEach(function (el) {
      var slot = (S.adSlots || {})[el.getAttribute("data-slot")] || "";
      el.classList.add("live"); el.innerHTML = "";
      var ins = document.createElement("ins"); ins.className = "adsbygoogle"; ins.style.display = "block";
      ins.setAttribute("data-ad-client", S.adsenseClient); if (slot) ins.setAttribute("data-ad-slot", slot);
      ins.setAttribute("data-ad-format", "auto"); ins.setAttribute("data-full-width-responsive", "true");
      el.appendChild(ins); (window.adsbygoogle = window.adsbygoogle || []).push({});
    });
  }

  /* ---------- cookie notice ---------- */
  var ck = $(".cookie");
  if (ck && !store.get("cookie-ok")) { ck.classList.add("show"); $$(".cookie button").forEach(function (b) { b.addEventListener("click", function () { store.set("cookie-ok", b.getAttribute("data-v") || "1"); ck.classList.remove("show"); }); }); }

  /* ---------- forms (all forms with data-form) ---------- */
  $$("form[data-form]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (f.querySelector(".hp input") && f.querySelector(".hp input").value) return; // bot
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var st = f.querySelector(".form-status"); var btn = f.querySelector("[type=submit]");
      var data = {}; new FormData(f).forEach(function (v, k) { if (k.charAt(0) !== "_" || k === "_subject") { data[k] = data[k] ? data[k] + ", " + v : v; } });
      data._subject = "[666667.com] " + (f.getAttribute("data-form") || "Form") + (data.name ? " — " + data.name : "");
      data._template = "table"; data._captcha = "false"; data.page = location.href;
      if (btn) { btn.disabled = true; btn.dataset.t = btn.textContent; btn.textContent = "Sending…"; }
      fetch(endpoint(), { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || j.success === "false" || j.success === false) throw new Error(j.message || "Failed"); }); })
        .then(function () {
          track("generate_lead", { form: f.getAttribute("data-form") });
          if (st) { st.className = "form-status ok"; st.textContent = f.getAttribute("data-ok") || "Thank you! We received your message and will reply within 1–2 business days."; }
          f.reset(); if (f.classList.contains("multistep")) goStep(f, 0);
        })
        .catch(function () {
          if (st) { st.className = "form-status err"; st.innerHTML = "We couldn't send that automatically. <a href='#' class='mail-fallback'>Click here to send it by email instead</a>."; }
          var mf = f.querySelector(".mail-fallback");
          if (mf) mf.addEventListener("click", function (ev) {
            ev.preventDefault(); var body = Object.keys(data).filter(function (k) { return k.charAt(0) !== "_"; }).map(function (k) { return k + ": " + data[k]; }).join("\n");
            location.href = "mai" + "lto:" + inbox() + "?subject=" + encodeURIComponent(data._subject) + "&body=" + encodeURIComponent(body);
          });
        })
        .then(function () { if (btn) { btn.disabled = false; btn.textContent = btn.dataset.t; } });
    });
  });

  /* ---------- multi-step forms ---------- */
  function goStep(f, i) {
    var steps = $$(".step", f); steps.forEach(function (s, k) { s.classList.toggle("active", k === i); });
    $$(".steps span", f).forEach(function (s, k) { s.classList.toggle("on", k <= i); });
    f.dataset.step = i;
  }
  $$("form.multistep").forEach(function (f) {
    goStep(f, 0);
    $$("[data-next]", f).forEach(function (b) { b.addEventListener("click", function () {
      var i = +f.dataset.step; var cur = $$(".step", f)[i]; var bad = $$("input,select,textarea", cur).filter(function (x) { return !x.checkValidity(); });
      if (bad.length) { bad[0].reportValidity(); return; } goStep(f, i + 1); track("lead_step", { step: i + 2 });
    }); });
    $$("[data-prev]", f).forEach(function (b) { b.addEventListener("click", function () { goStep(f, Math.max(0, +f.dataset.step - 1)); }); });
    var q = new URLSearchParams(location.search).get("type");
    if (q) { var r = f.querySelector("input[name=inquiry_type][value='" + q + "']"); if (r) r.checked = true; }
  });

  /* ---------- YouTube facades ---------- */
  function videoCard(v) {
    return '<figure class="card" style="padding:12px;margin:0"><div class="video" data-yt="' + v.id + '" role="button" tabindex="0" aria-label="Play video: ' + v.title.replace(/"/g, "") + '">' +
      '<img loading="lazy" src="https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg" alt="">' +
      '<span class="play" aria-hidden="true">▶</span></div><figcaption style="margin-top:10px"><b>' + v.title + '</b><br><span class="small muted">' + (v.by || "") + '</span></figcaption></figure>';
  }
  $$("[data-videos]").forEach(function (box) {
    var n = +box.getAttribute("data-videos") || 99; box.innerHTML = (S.videos || []).slice(0, n).map(videoCard).join("");
  });
  document.addEventListener("click", function (e) { var v = e.target.closest && e.target.closest(".video[data-yt]"); if (v) playVideo(v); });
  document.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.matches && e.target.matches(".video[data-yt]")) playVideo(e.target); });
  function playVideo(v) {
    if (v.querySelector("iframe")) return;
    v.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + v.getAttribute("data-yt") + '?autoplay=1&rel=0" title="YouTube video" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    track("video_play", { id: v.getAttribute("data-yt") });
  }
  $$("[data-channel]").forEach(function (a) { a.href = S.youtubeChannel || "#"; });

  /* ---------- donation buttons ---------- */
  var D = S.donate || {};
  $$("[data-pay]").forEach(function (b) { var u = D[b.getAttribute("data-pay")]; if (u) { b.href = u; b.hidden = false; } else b.hidden = true; });
  $$("[data-goal]").forEach(function (el) {
    var pct = D.goal ? Math.min(100, Math.round((D.raised || 0) / D.goal * 100)) : 0;
    el.innerHTML = '<div class="progress" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><span style="width:' + Math.max(pct, 2) + '%"></span></div>' +
      '<p class="small muted" style="margin-top:8px"><b class="num">' + (D.currency || "USD") + " " + (D.raised || 0).toLocaleString() + '</b> raised of <b class="num">' + (D.goal || 0).toLocaleString() + '</b> goal (' + pct + '%)</p>';
  });
  $$(".amount-pick button").forEach(function (b) { b.addEventListener("click", function () {
    var f = b.closest("form"); var inp = f && f.querySelector("[name=amount]"); if (inp) inp.value = b.getAttribute("data-amt");
    $$(".amount-pick button", f).forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
  }); });

  /* ---------- countdown (contest) ---------- */
  $$("[data-countdown]").forEach(function (el) {
    var end = S.contest && S.contest.endsISO ? new Date(S.contest.endsISO) : (function () { var d = new Date(); return new Date(d.getFullYear(), d.getMonth() + 1, 1); })();
    function tick() {
      var ms = Math.max(0, end - new Date()); var d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
      el.innerHTML = [[d, "days"], [h, "hours"], [m, "min"], [s, "sec"]].map(function (x) { return "<div><b>" + String(x[0]).padStart(2, "0") + "</b><span class='small muted'>" + x[1] + "</span></div>"; }).join("");
    }
    tick(); setInterval(tick, 1000);
  });

  /* ---------- slide-in lead magnet (once per session, after 45% scroll) ---------- */
  var sl = $(".slidein");
  if (sl && !store.sget("slid") && !store.get("subscribed")) {
    var onScroll = function () {
      var p = (window.scrollY + innerHeight) / document.body.scrollHeight;
      if (p > 0.45) { sl.classList.add("show"); store.sset("slid", "1"); window.removeEventListener("scroll", onScroll); }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    var x = sl.querySelector(".x"); if (x) x.addEventListener("click", function () { sl.classList.remove("show"); });
  }

  /* ---------- share ---------- */
  $$("[data-share]").forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault();
    var url = b.getAttribute("data-url") || location.href, title = b.getAttribute("data-title") || document.title;
    if (navigator.share) navigator.share({ title: title, url: url }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast("Link copied!"); });
  }); });

  /* ---------- number search (numbers page) ---------- */
  var ns = $("#numsearch");
  if (ns) ns.addEventListener("input", function () {
    var q = ns.value.trim().toLowerCase();
    $$("[data-search]").forEach(function (el) { el.hidden = q && el.getAttribute("data-search").toLowerCase().indexOf(q) === -1; });
  });
  var nf = $$(".filter-btn");
  nf.forEach(function (b) { b.addEventListener("click", function () {
    var v = b.getAttribute("data-f"); nf.forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
    $$("[data-v]").forEach(function (el) { el.hidden = v !== "all" && el.getAttribute("data-v") !== v && el.getAttribute("data-cat") !== v; });
  }); });

  /* ---------- year ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
