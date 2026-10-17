#!/usr/bin/env node
/* Generates the static pages from js/data.js:
     index.html, properties/, about/, contact/, <property-slug>/, 404.html, sitemap.xml, robots.txt
   Every page gets a clean URL (no .html) and its own title, description and share image.
   Run:  node build.js   (after every change to js/data.js) */
const fs = require("fs"), path = require("path"), vm = require("vm");
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, "js/data.js"), "utf8"), ctx);
const { SITE, PROPERTIES } = ctx.window;
const { make } = require("./js/render.js");
const props = PROPERTIES.slice(0, 3);
const base = (process.env.SITE_URL || SITE.url || "").replace(/\/+$/, "");
if (!base) console.warn('WARNING: SITE.url is empty in js/data.js. Set it to your live domain (e.g. "https://www.example.com") so shared links show the right photo and title.');
const esc = s => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const outs = [];
function build(key, out, rootPath) {
  const R = make(SITE, props, { root: rootPath, href: k => (rootPath === "/" ? "/" + (k ? k + "/" : "") : (k === "" ? (rootPath || "./") : rootPath + k + "/")) });
  const pg = R.page(key);
  const url = base ? base + "/" + (key && key !== "404" ? key + "/" : "") : "";
  const img = base ? base + "/" + pg.image : rootPath + pg.image;
  let ld = "";
  if (pg.p) {
    const n = (pg.p.price || "").replace(/[^\d]/g, ""), cur = { "€": "EUR", "$": "USD", "£": "GBP" }[(pg.p.price || "")[0]];
    ld = { "@context": "https://schema.org", "@type": "RealEstateListing", name: pg.p.name, description: pg.p.blurb || pg.p.summary, url: url || undefined,
      image: pg.p.photos.map((_, i) => (base || "") + "/images/" + pg.p.slug + "/" + (i + 1) + ".jpg"),
      offers: n && cur ? { "@type": "Offer", price: n, priceCurrency: cur } : undefined };
  } else if (key === "") ld = { "@context": "https://schema.org", "@type": "Organization", name: SITE.name, url: url || undefined, email: SITE.email, telephone: SITE.phone };
  const html = `<!DOCTYPE html>
<html lang="en" data-root="${rootPath}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(pg.title)}</title>
${pg.desc ? `<meta name="description" content="${esc(pg.desc)}">` : ""}
${pg.noindex ? '<meta name="robots" content="noindex">' : ""}
${url ? `<link rel="canonical" href="${url}">` : ""}
<meta name="theme-color" content="#0e2036">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:type" content="${pg.p ? "article" : "website"}">
<meta property="og:title" content="${esc(pg.title)}">
${pg.desc ? `<meta property="og:description" content="${esc(pg.desc)}">` : ""}
${url ? `<meta property="og:url" content="${url}">` : ""}
<meta property="og:image" content="${img}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${rootPath}favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<script>try{var t=localStorage.getItem("hk-theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>
<link rel="stylesheet" href="${rootPath}css/style.css">
${ld ? `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>` : ""}
</head>
<body${pg.inner ? ' class="inner"' : ""}>
${R.header(pg.active)}
<main id="app">${pg.main}</main>
${R.footer()}
${R.lightbox()}
<script src="${rootPath}js/data.js"></script>
<script src="${rootPath}js/app.js"></script>
</body>
</html>
`;
  fs.mkdirSync(path.dirname(path.join(__dirname, out)), { recursive: true });
  fs.writeFileSync(path.join(__dirname, out), html); outs.push(out);
  return key === "404" ? null : (key ? key + "/" : "");
}

const written = [];
written.push(build("", "index.html", ""));
for (const k of ["properties", "about", "contact", ...props.map(p => p.slug)]) written.push(build(k, k + "/index.html", "../"));
build("404", "404.html", "/");
if (base) {
  fs.writeFileSync(path.join(__dirname, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${written.map(w => `  <url><loc>${base}/${w}</loc></url>`).join("\n")}\n</urlset>\n`);
  fs.writeFileSync(path.join(__dirname, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
}
// Safety check: no link, image, canonical or share tag may contain ".html"
let bad = 0;
const scan = (name, text) => { for (const m of text.matchAll(/(?:href|src|content|<loc>|url)[="'>:\s]*"?([^"'<\s]*\.html[^"'<\s]*)/g)) { console.error("ERROR: .html found in " + name + ": " + m[1]); bad++; } };
outs.forEach(f => scan(f, fs.readFileSync(path.join(__dirname, f), "utf8")));
["sitemap.xml", "robots.txt"].forEach(f => fs.existsSync(path.join(__dirname, f)) && scan(f, fs.readFileSync(path.join(__dirname, f), "utf8")));
if (bad) process.exitCode = 1; else console.log("Link check passed: no .html in any link, canonical or share tag.");
console.log("Built " + (written.length + 1) + " pages: " + written.map(w => "/" + w).join("  "));
