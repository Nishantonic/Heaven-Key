(function () {
  "use strict";
  const SITE = window.SITE, PROPERTIES = (window.PROPERTIES || []).slice(0, 3);
  const root = document.documentElement.dataset.root || "";
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const vh = () => window.innerHeight;

  // Never show "index.html" in the address bar of the live site
  if (/^https?:$/.test(location.protocol) && /\/index\.html$/.test(location.pathname))
    history.replaceState(null, "", location.pathname.replace(/index\.html$/, "") + location.search + location.hash);
  // Opening the files directly from a folder (file://) cannot show folder links, so point them at index.html.
  if (location.protocol === "file:") $$("a[href]").forEach(l => {
    const h = l.getAttribute("href");
    if (/^(https?:|mailto:|tel:|#)/.test(h)) return;
    const i = h.indexOf("#"), path = i < 0 ? h : h.slice(0, i), hash = i < 0 ? "" : h.slice(i);
    if (path === "" || path.endsWith("/")) l.setAttribute("href", path + "index.html" + hash);
  });

  /* ---- theme toggle (remembers the choice in this browser) ---- */
  const tb = $("#theme");
  if (tb) tb.addEventListener("click", () => {
    const d = document.documentElement, cur = d.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = cur === "dark" ? "light" : "dark"; d.dataset.theme = next;
    try { localStorage.setItem("hk-theme", next); } catch (e) {}
  });

  /* ---- scroll: progress bar, nav hide, hero parallax, film scale ---- */
  const nav = $("#nav"), prog = $("#progress"), heroBg = $("#heroBg"), frame = $("#frame");
  let lastY = 0, tick = false;
  function onScroll() {
    const y = window.scrollY, max = document.documentElement.scrollHeight - vh();
    if (prog) prog.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    if (nav) { if (y > 200 && y > lastY + 4) nav.classList.add("hide"); else if (y < lastY - 4 || y < 200) nav.classList.remove("hide"); }
    lastY = y;
    if (!reduce) {
      if (heroBg && y < vh() * 1.2) heroBg.style.transform = "translate3d(0," + (y * .16) + "px,0)";
      if (frame) { const r = frame.getBoundingClientRect(), p = Math.max(0, Math.min(1, (vh() - r.top) / (vh() * .85))); frame.style.transform = "scale(" + (.88 + .12 * p) + ")"; }
    }
    tick = false;
  }
  window.addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll); onScroll();

  /* ---- cursor spotlight (hero) and glow (cards, form) ---- */
  const glow = el => el && el.addEventListener("pointermove", e => { const r = el.getBoundingClientRect(); el.style.setProperty("--mx", (e.clientX - r.left) + "px"); el.style.setProperty("--my", (e.clientY - r.top) + "px"); });
  glow($("#hero")); $$(".cell").forEach(glow); glow($("#enquiry"));
  const form = $("#enquiry");
  if (form && !reduce && matchMedia("(hover:hover)").matches) {
    form.addEventListener("pointermove", e => { const r = form.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; form.style.transform = "perspective(1200px) rotateY(" + (x * 3) + "deg) rotateX(" + (-y * 3) + "deg)"; });
    form.addEventListener("pointerleave", () => { form.style.transform = ""; });
  }

  /* ---- count-up numbers ---- */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; io.unobserve(e.target);
      const el = e.target, to = +el.dataset.count; if (reduce || !to) { el.textContent = to || 0; return; }
      const t0 = performance.now(), d = 1400;
      (function f(t) { const k = Math.min(1, (t - t0) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
    }), { threshold: .6 });
    $$("[data-count]").forEach(el => io.observe(el));
  }

  /* ---- photo carousel (drag, swipe, arrows) + full-screen viewer ---- */
  const cards = $("#cards"), lb = $("#lb");
  let moved = 0, down = false, sx = 0, sl = 0, cur = 0, photos = [];
  if (cards) {
    const step = () => { const c = $(".pc", cards); return c ? c.offsetWidth + 18 : 300; };
    $("#prev").onclick = () => cards.scrollBy({ left: -step() * 1.5, behavior: "smooth" });
    $("#next").onclick = () => cards.scrollBy({ left: step() * 1.5, behavior: "smooth" });
    cards.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") return; down = true; moved = 0; sx = e.clientX; sl = cards.scrollLeft; });
    window.addEventListener("pointermove", e => { if (!down) return; const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); if (moved > 5) { cards.classList.add("drag"); cards.scrollLeft = sl - dx; } });
    window.addEventListener("pointerup", () => { if (!down) return; down = false; setTimeout(() => cards.classList.remove("drag"), 0); });
    cards.addEventListener("keydown", e => { if (e.key === "ArrowRight") cards.scrollBy({ left: step(), behavior: "smooth" }); if (e.key === "ArrowLeft") cards.scrollBy({ left: -step(), behavior: "smooth" }); });
    photos = $$(".pc img", cards).map(im => ({ src: im.getAttribute("src"), cap: im.alt }));
    const show = i => { cur = (i + photos.length) % photos.length; const im = $("#lbi"); im.src = photos[cur].src; im.alt = photos[cur].cap; $("#lbc").textContent = photos[cur].cap + "  ·  " + (cur + 1) + " / " + photos.length; };
    $$(".pc", cards).forEach(b => b.addEventListener("click", () => { if (moved > 5) { moved = 0; return; } show(+b.dataset.i); if (lb && lb.showModal && !lb.open) lb.showModal(); }));
    if (lb) {
      $$("[data-lb]", lb).forEach(b => b.addEventListener("click", () => { const k = b.dataset.lb; if (k === "close") lb.close(); else show(cur + (k === "next" ? 1 : -1)); }));
      lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });
      lb.addEventListener("keydown", e => { if (e.key === "ArrowRight") show(cur + 1); if (e.key === "ArrowLeft") show(cur - 1); });
      let tx = null;
      lb.addEventListener("touchstart", e => { tx = e.touches[0].clientX; }, { passive: true });
      lb.addEventListener("touchend", e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; tx = null; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); }, { passive: true });
    }
  }

  /* ---- sticky scroll reveal ---- */
  const steps = $$(".step[data-img]"), imgs = $$("#media img"), cap = $("#cap");
  if (steps.length && "IntersectionObserver" in window) {
    const so = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      steps.forEach(s => s.classList.toggle("on", s === e.target));
      const i = +e.target.dataset.img; imgs.forEach((im, k) => im.classList.toggle("on", k === i));
      if (cap && imgs[i]) cap.textContent = imgs[i].dataset.cap || "";
    }), { rootMargin: "-42% 0px -42% 0px" });
    steps.forEach(s => so.observe(s));
  }

  /* ---- video: plays silently while visible, with a pause button ---- */
  const vid = $("#vid"), vb = $("#vbtn"), vi = $("#vicon");
  if (vid) {
    let userPaused = false;
    const PAUSE = "M7 5h4v14H7zM13 5h4v14h-4z", PLAY = "M8 5v14l11-7z";
    const ico = () => { if (!vi) return; vi.firstElementChild.setAttribute("d", vid.paused ? PLAY : PAUSE); vb.setAttribute("aria-label", vid.paused ? "Play video" : "Pause video"); };
    const play = () => { vid.muted = true; const p = vid.play(); if (p && p.catch) p.catch(() => {}); };
    if (vb) vb.onclick = () => { if (vid.paused) { userPaused = false; play(); } else { userPaused = true; vid.pause(); } ico(); };
    vid.addEventListener("play", ico); vid.addEventListener("pause", ico);
    if (!reduce && "IntersectionObserver" in window) new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { if (!userPaused) play(); } else vid.pause(); }), { threshold: .35 }).observe(vid);
    else ico();
  }

  /* ---- copy buttons ---- */
  $$("[data-copy]").forEach(b => b.addEventListener("click", () => {
    const el = document.getElementById(b.dataset.copy), t = el.textContent;
    const sel = () => { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = "Selected"; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(() => { b.textContent = "Copied"; }, sel); else sel();
    setTimeout(() => { b.textContent = "Copy"; }, 1800);
  }));

  /* ---- share button: phone/computer share menu, or copies the link ---- */
  const propUrl = slug => SITE.url ? SITE.url.replace(/\/+$/, "") + "/" + slug + "/" : new URL(root + slug + "/", location.href).href;
  async function copyText(t) {
    try { await navigator.clipboard.writeText(t); return true; }
    catch { try { const i = document.createElement("input"); i.value = t; document.body.appendChild(i); i.select(); const ok = document.execCommand("copy"); i.remove(); return ok; } catch { return false; } }
  }
  document.addEventListener("click", async e => {
    const btn = e.target.closest("[data-share]"); if (!btn) return; e.preventDefault();
    const p = PROPERTIES.find(x => x.slug === btn.closest(".share").dataset.slug); if (!p) return;
    const url = propUrl(p.slug), text = `${p.name}, ${p.place}${p.price ? " — " + p.price : ""}. ${SITE.tagline}`;
    if (navigator.share) { try { await navigator.share({ title: p.name, text, url }); return; } catch (err) { if (err && err.name === "AbortError") return; } }
    const ok = await copyText(url), label = btn.querySelector("span"), old = label.textContent;
    label.textContent = ok ? "Link copied" : "Copy failed"; setTimeout(() => (label.textContent = old), 2200);
  });

  /* ---- enquiry form ---- */
  document.addEventListener("submit", async e => {
    if (e.target.id !== "enquiry") return;
    e.preventDefault();
    const f = e.target, s = f.querySelector(".status"), b = f.querySelector("button.send");
    s.className = "status";
    if (!f.checkValidity()) { s.classList.add("err"); s.textContent = "Please complete the required fields and tick the consent box."; f.reportValidity(); return; }
    if (f.visit_from.value && f.visit_to.value && f.visit_to.value < f.visit_from.value) { s.classList.add("err"); s.textContent = "The end date must be after the start date."; return; }
    if (f._gotcha.value) { s.classList.add("ok"); s.textContent = "Thank you."; return; } // spam trap
    const key = SITE.web3formsKey, hasKey = key && !/YOUR_/.test(key);
    const hasEp = SITE.formEndpoint && !/YOUR_/.test(SITE.formEndpoint);
    if (!hasKey && !hasEp) { s.textContent = "Demo mode: add the Web3Forms access key in js/data.js to receive enquiries by email."; return; }
    b.disabled = true; s.textContent = "Sending…";
    try {
      const fd = new FormData(f), subject = `Enquiry: ${f.property.value} (${f.interest.value})`;
      fd.delete("_gotcha");
      let ok;
      if (hasKey) {
        fd.set("access_key", key); fd.set("subject", subject); fd.set("from_name", SITE.name + " website");
        const r = await fetch("https://api.web3forms.com/submit", { method: "POST", headers: { Accept: "application/json" }, body: fd });
        ok = r.ok && (await r.json()).success;
      } else {
        fd.set("_subject", subject);
        ok = (await fetch(SITE.formEndpoint, { method: "POST", headers: { Accept: "application/json" }, body: fd })).ok;
      }
      if (!ok) throw new Error();
      f.reset(); s.classList.add("ok"); s.textContent = "Thank you. We will reply within one working day.";
    } catch {
      s.classList.add("err"); s.textContent = `Message not sent. Please email ${SITE.email} instead.`;
    } finally { b.disabled = false; }
  });
})();
