/* Page templates. Used by build.js (Node) to generate the static pages. */
(function (g) {
  "use strict";
  function make(SITE, ALL, o) {
    o = o || {};
    const PROPERTIES = ALL.slice(0, 3);
    const root = o.root || "";
    const asset = o.asset || (p => root + p);
    const href = o.href || (k => (k === "" ? (root || "./") : root + k + "/"));
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const svg = (d, s = 18, sw = 1.5) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
    const I = {
      pin: svg("M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21zM12 7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z", 16),
      bed: svg("M3 19v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 16h18M6 10V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3", 26, 1.4),
      bath: svg("M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2zM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2", 26, 1.4),
      area: svg("M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5", 26, 1.4),
      plot: svg("M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14", 26, 1.4),
      share: svg("M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14", 17),
      left: svg("M15 18l-6-6 6-6", 18, 1.6), right: svg("M9 6l6 6-6 6", 18, 1.6), arrow: svg("M5 12h14M13 6l6 6-6 6", 16, 1.6),
      theme: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4v16a8 8 0 0 0 0-16z" fill="currentColor"/></svg>`
    };

    // "Haven & Key" -> Haven <i>&</i> Key
    const brandHTML = (n = SITE.name) => { const p = String(n).split(" & "); return p.length === 2 ? `${esc(p[0])} <i>&amp;</i> ${esc(p[1])}` : esc(n); };
    const photoSrc = (p, i) => asset("images/" + p.slug + "/" + i + ".jpg");
    const img = (p, i, eager = false) =>
      `<img src="${photoSrc(p, i)}" alt="${esc(p.name + " — " + (p.photos[i - 1] || "photo " + i))}" loading="${eager ? "eager" : "lazy"}" decoding="async" draggable="false" onerror="this.removeAttribute('src');this.onerror=null">`;
    const priceHTML = p => p.price ? `<p class="price">${esc(p.price)}${p.status ? ` <span class="pill">${esc(p.status)}</span>` : ""}</p>` : "";

    /* ---------- shared bits ---------- */
    const header = active => `<header class="nav" id="nav">
      <a class="brand" href="${href("")}">${brandHTML()}</a>
      <nav aria-label="Main"><ul>
        <li><a href="${href("")}"${active === "home" ? ' aria-current="page"' : ""}>Properties</a></li>
        <li><a href="${href("about")}"${active === "about" ? ' aria-current="page"' : ""}>About</a></li>
        <li><a href="${href("contact")}"${active === "contact" ? ' aria-current="page"' : ""}>Contact</a></li>
      </ul></nav>
      <button class="tbtn" id="theme" type="button" aria-label="Switch light or dark theme">${I.theme}</button>
      <a class="pill-btn" href="${active === "contact" ? "#enquire" : href("contact") + "#enquire"}">Enquire</a>
    </header><div class="progress" id="progress" aria-hidden="true"></div>`;

    const footer = () => `<footer><div class="wrap">
      <div class="fgrid"><span>&copy; ${new Date().getFullYear()} ${esc(SITE.name)}. All rights reserved.</span>
        <span class="fcontact"><a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a> &nbsp; ${esc(SITE.phone)}</span>
        <nav aria-label="Footer"><a href="${href("")}">Properties</a><a href="${href("about")}">About</a><a href="${href("contact")}">Contact</a></nav></div>
      <div class="big" aria-hidden="true">${brandHTML()}</div></div></footer>`;

    const lightbox = () => `<dialog id="lb" aria-label="Photo viewer">
      <button class="lb x" data-lb="close" aria-label="Close">${svg("M6 6l12 12M18 6L6 18", 20, 1.6)}</button>
      <button class="lb p" data-lb="prev" aria-label="Previous photo">${svg("M15 18l-6-6 6-6", 22, 1.6)}</button>
      <img id="lbi" alt="">
      <button class="lb n" data-lb="next" aria-label="Next photo">${svg("M9 6l6 6-6 6", 22, 1.6)}</button>
      <p class="lbcap" id="lbc"></p></dialog>`;

    function videoHTML(p) {
      const v = p.video; if (!v) return "";
      const yt = v.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
      const vm = v.match(/vimeo\.com\/(\d+)/);
      let inner;
      if (yt) inner = `<iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&mute=1&loop=1&playlist=${yt[1]}&playsinline=1&rel=0" title="${esc(p.name)} video" allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe>`;
      else if (vm) inner = `<iframe src="https://player.vimeo.com/video/${vm[1]}?autoplay=1&muted=1&loop=1" title="${esc(p.name)} video" allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe>`;
      else inner = `<video id="vid" muted loop playsinline preload="metadata" data-autoplay poster="${asset("images/" + p.slug + "/1.jpg")}" aria-label="${esc(p.name)} video"><source src="${asset(v)}" type="video/mp4">Your browser cannot play this video.</video>
        <button class="vbtn" id="vbtn" type="button" aria-label="Pause video"><svg id="vicon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg></button>`;
      return `<section class="film" id="film"><div class="wrap">
        <div class="film-head"><div><span class="label">Walk-through</span><h2>See it moving.</h2></div>
        <p class="hint">Plays silently while it is on screen.</p></div>
        <div class="frame" id="frame">${inner}</div></div></section>`;
    }

    function formHTML(selected, title) {
      const opts = PROPERTIES.map(p => `<option value="${esc(p.name)}"${p.slug === selected ? " selected" : ""}>${esc(p.name)}</option>`).join("");
      return `<form id="enquiry" novalidate>
        <h3>${title}</h3>
        <p class="sub">We reply within one working day.</p>
        <div class="f"><label for="f-name">Full name</label><input id="f-name" name="name" autocomplete="name" required></div>
        <div class="two">
          <div class="f"><label for="f-email">Email address</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
          <div class="f"><label for="f-phone">Phone number</label><input id="f-phone" name="phone" type="tel" autocomplete="tel"></div>
        </div>
        <div class="two">
          <div class="f"><label for="f-int">I am interested in</label><select id="f-int" name="interest"><option>Buying</option><option>Renting</option></select></div>
          <div class="f"><label for="f-prop">Property</label><select id="f-prop" name="property"><option value="Any">Any property</option>${opts}</select></div>
        </div>
        <div class="two">
          <div class="f"><label for="f-in">Visit from</label><input id="f-in" name="visit_from" type="date"></div>
          <div class="f"><label for="f-out">Visit to</label><input id="f-out" name="visit_to" type="date"></div>
        </div>
        <div class="f"><label for="f-msg">Message</label><textarea id="f-msg" name="message"></textarea></div>
        <input class="hp" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">
        <label class="consent"><input id="f-consent" type="checkbox" name="consent" required>
          <span>I agree that my details are used to answer this enquiry and are not shared with third parties.</span></label>
        <button class="send" type="submit">Send enquiry</button>
        <p class="status" role="status" aria-live="polite"></p>
      </form>`;
    }

    const enquireSection = selected => `<section class="sec band" id="enquire"><div class="wrap enq">
      <div>
        <span class="label">No brokers</span>
        <h2>Write to the <em>owner.</em></h2>
        <p>${esc(SITE.tagline)} Send your questions and we will reply within one working day, from the first viewing to the final signature.</p>
        <div class="lines">
          <div class="line"><span id="mail">${esc(SITE.email)}</span><button type="button" data-copy="mail">Copy</button></div>
          <div class="line"><span id="tel">${esc(SITE.phone)}</span><button type="button" data-copy="tel">Copy</button></div>
          <div class="line"><span>${esc(SITE.address)}</span></div>
        </div>
      </div>
      ${formHTML(selected, "Send an enquiry")}
    </div></section>`;

    /* ---------- hero ---------- */
    function heroHTML() {
      const sentences = String(SITE.tagline).split(/(?<=[.!?])\s+/);
      let i = 0;
      const accent = String(SITE.accentWord || "").toLowerCase();
      const lines = sentences.map(s => `<span class="ln">${s.split(/\s+/).map(w => {
        const clean = w.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase(), k = i++;
        const inner = accent && clean === accent ? `<em>${esc(w)}</em>` : esc(w);
        return `<span class="w" style="--i:${k}">${inner}</span>`;
      }).join(" ")}</span>`).join("");
      return `<section class="hero" id="hero">
        <div class="hero-bg" id="heroBg"><img src="${asset(SITE.heroImage)}" alt="" fetchpriority="high" onerror="this.removeAttribute('src');this.onerror=null"></div>
        <div class="wrap">
          <span class="label">${esc(SITE.eyebrow)}</span>
          <h1>${lines}</h1>
          <p class="intro">${esc(SITE.intro)}</p>
          <div class="cta-row">
            <a class="shimmer" href="#property">View properties ${I.arrow}</a>
            ${PROPERTIES[0] && PROPERTIES[0].video ? `<a class="ghost" href="#film">Watch the film</a>` : ""}
          </div>
          <div class="chips">${(SITE.chips || []).map(c => `<span class="chip">${esc(c)}</span>`).join("")}</div>
        </div>
      </section>
      <div class="marquee" aria-hidden="true"><div class="track">${[0, 1].map(() => (SITE.marquee || []).map(t => `<span>${esc(t)}</span>`).join("")).join("")}</div></div>`;
    }

    /* ---------- property blocks ---------- */
    function headBlock(p, tag) {
      const words = String(p.name).split(" "), last = words.pop();
      const title = words.length ? `${esc(words.join(" "))} <em>${esc(last)}</em>` : `<em>${esc(last)}</em>`;
      return `<div class="wrap fhead">
        <div><span class="label">${tag === "h1" ? "Property" : "Featured property"}</span><${tag}>${title}</${tag}></div>
        <div class="fmeta">
          <p class="where">${I.pin}${esc(p.place)}</p>
          ${priceHTML(p)}
          <p class="blurb">${esc(p.blurb || p.summary)}</p>
          <div class="share" data-slug="${p.slug}"><button type="button" class="share-btn" data-share>${I.share}<span>Share this property</span></button></div>
        </div></div>`;
    }
    const carouselHTML = p => `<div class="cards-wrap" data-slug="${p.slug}">
      <div class="cards" id="cards" tabindex="0" aria-label="Photo carousel, scroll sideways">
        ${p.photos.map((c, k) => `<button class="pc" type="button" data-i="${k}" aria-label="Enlarge photo: ${esc(c)}">${img(p, k + 1, k < 2)}<span><b>${esc(c)}</b><small>${String(k + 1).padStart(2, "0")} / ${String(p.photos.length).padStart(2, "0")}</small></span></button>`).join("")}
      </div>
      <div class="wrap cbar"><span class="hint">Drag, swipe or use the arrows. Tap a photo to enlarge.</span>
        <div class="arrows"><button id="prev" type="button" aria-label="Previous photos">${I.left}</button><button id="next" type="button" aria-label="Next photos">${I.right}</button></div></div>
    </div>`;
    function statsHTML(p) {
      const list = [...(SITE.stats || []), { n: p.photos.length, u: "", l: "Photographs of the home" }];
      if (p.videoSeconds) list.push({ n: p.videoSeconds, u: "sec", l: "Walk-through film" });
      return `<section class="wrap" aria-label="At a glance"><div class="stats" style="--n:${list.length}">${list.map(s =>
        `<div class="stat"><strong><span data-count="${esc(s.n)}">${esc(s.n)}</span>${s.u ? `<sup>${esc(s.u)}</sup>` : ""}</strong><span>${esc(s.l)}</span></div>`).join("")}</div></section>`;
    }
    function tourHTML(p) {
      const steps = (p.tour && p.tour.length ? p.tour : p.features.map((f, i) => ({ label: "", title: f, text: "", photo: (i % p.photos.length) + 1 }))).slice(0, 6);
      return `<section class="tour sec" id="tour"><div class="wrap tour-grid">
        <div class="steps">
          <div class="step steps-intro on"><span class="label">Inside the home</span><h2>${esc(p.tourTitle || "Take a look inside.")}</h2></div>
          ${steps.map((s, k) => `<div class="step" data-img="${k}"><span class="n">${esc(String(s.label || "").toUpperCase())}</span><h3>${esc(s.title)}</h3>${s.text ? `<p>${esc(s.text)}</p>` : ""}</div>`).join("")}
        </div>
        <div class="media" id="media" aria-live="polite">
          ${steps.map((s, k) => `<img${k === 0 ? ' class="on"' : ""} data-cap="${esc(p.photos[s.photo - 1] || p.name)}" src="${photoSrc(p, s.photo)}" alt="${esc(p.photos[s.photo - 1] || p.name)}" loading="lazy" onerror="this.removeAttribute('src');this.onerror=null">`).join("")}
          <span class="cap" id="cap">${esc(p.photos[steps[0].photo - 1] || p.name)}</span>
        </div></div></section>`;
    }
    function bentoHTML(p) {
      const dp = p.detailPhoto || 1;
      const mini = [[I.bed, p.beds, "Bedrooms"], [I.bath, p.baths, "Bathrooms"], [I.area, p.area, "Built area"], [I.plot, p.plot, "Plot area"]];
      return `<section class="sec bentosec" id="details"><div class="wrap">
        <div class="bhead"><div><span class="label">Property details</span><h2>The essentials.</h2></div></div>
        <div class="bento">
          <div class="cell c-desc"><h3>About the property</h3>${p.desc.map(t => `<p>${esc(t)}</p>`).join("")}
            <ul class="feat">${p.features.map(f => `<li>${esc(f)}</li>`).join("")}</ul></div>
          <figure class="cell c-img">${img(p, dp)}<figcaption>${esc(p.photos[dp - 1] || p.name)}</figcaption></figure>
          <div class="cell c-spec"><h3>Specifications</h3><dl class="specs">${p.specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd${/^[—-]$/.test(v) ? ' class="tbc"' : ""}>${/^[—-]$/.test(v) ? "To be confirmed" : esc(v)}</dd></div>`).join("")}</dl></div>
          ${mini.map(([ic, v, l]) => `<div class="cell c-mini">${ic}<b>${esc(v)}</b><span>${l}</span></div>`).join("")}
        </div></div></section>`;
    }
    const card = p => `<a class="pcard" href="${href(p.slug)}">
      <div class="im">${img(p, 1)}${p.status ? `<span class="flag">${esc(p.status)}</span>` : ""}</div>
      <div class="body"><h3>${esc(p.name)}</h3><p class="where">${I.pin}${esc(p.place)}</p>${priceHTML(p)}</div></a>`;
    const others = (list, title) => list.length ? `<section class="sec band" id="more"><div class="wrap"><div class="bhead"><div><span class="label">More homes</span><h2>${title}</h2></div>
      <a class="more-link" href="${href("properties")}">View all ${I.arrow}</a></div><div class="pgrid">${list.map(card).join("")}</div></div></section>` : "";

    const propBlocks = (p, tag) => `<section class="sec" id="property">${headBlock(p, tag)}${carouselHTML(p)}</section>
      ${statsHTML(p)}${tourHTML(p)}${videoHTML(p)}${bentoHTML(p)}`;

    const homeMain = () => `${heroHTML()}${propBlocks(PROPERTIES[0], "h2")}${others(PROPERTIES.slice(1), "Other properties")}${enquireSection(PROPERTIES[0].slug)}`;
    const villaMain = p => `<div class="wrap crumbrow"><a class="crumb" href="${href("")}">&larr; All properties</a></div>${propBlocks(p, "h1")}${others(PROPERTIES.filter(x => x !== p), "Other properties")}${enquireSection(p.slug)}`;
    const simple = (title, body) => `<section class="sec page"><div class="wrap simple"><h1>${title}</h1><div>${body}</div></div></section>`;

    // key: "" (home), "properties", "about", "contact", "404" or a property slug
    function page(key) {
      const p = PROPERTIES.find(x => x.slug === key);
      if (p) return { key, p, active: "home", inner: true, main: villaMain(p),
        title: `${p.name}, ${p.place}${p.price ? " — " + p.price : ""} | ${SITE.name}`, desc: p.blurb || p.summary, image: `images/${p.slug}/1.jpg` };
      const base = { key, image: SITE.heroImage };
      if (key === "properties") return { ...base, active: "home", inner: true, title: `Properties | ${SITE.name}`, desc: `${SITE.tagline} ${SITE.intro}`,
        main: `<section class="sec page"><div class="wrap"><div class="bhead"><div><span class="label">Private homes</span><h1>Properties</h1></div></div><div class="pgrid">${PROPERTIES.map(card).join("")}</div></div></section>` };
      if (key === "about") return { ...base, active: "about", inner: true, title: `About | ${SITE.name}`, desc: SITE.about[0],
        main: simple("About us", SITE.about.map(t => `<p>${esc(t)}</p>`).join("")) };
      if (key === "contact") return { ...base, active: "contact", inner: true, title: `Contact | ${SITE.name}`, desc: `${SITE.tagline} Send an enquiry and we reply within one working day.`,
        main: `<div class="pagepad"></div>${enquireSection("")}` };
      if (key === "404") return { ...base, active: "", inner: true, title: `Page not found | ${SITE.name}`, desc: "", noindex: true,
        main: simple("Page not found", `<p>This page does not exist.</p><p><a class="more-link" href="${href("")}">Back to all properties ${I.arrow}</a></p>`) };
      return { ...base, active: "home", inner: false, title: `${SITE.name} — Private homes, direct from the owner`, desc: `${SITE.tagline} ${SITE.intro}`, main: homeMain() };
    }
    return { page, header, footer, lightbox, photoSrc, esc, PROPERTIES };
  }
  g.Render = { make };
  if (typeof module !== "undefined") module.exports = { make };
})(typeof window !== "undefined" ? window : globalThis);
