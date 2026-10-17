# Haven & Key — private property showcase

A fast static website for 2–3 properties sold directly by the owner. No framework and no database.
Every property has its own **clean link** (`/rooftop-apartment/`, never `.html`), its own page title and its own share image.

## Quick start
```bash
node build.js     # generates the pages from js/data.js (also checks that no link contains .html)
node serve.js     # local server with clean addresses, open http://localhost:8000/
```
**Run `node build.js` after every change to `js/data.js`.** The generated pages are part of the folder, so hosting needs no build step.

## What's in the design
- Floating glass navigation that hides as you scroll, with a light / dark switch
- Full-bleed hero with word-by-word headline, cursor spotlight and shimmering button
- Scrolling phrase strip, count-up numbers, gold scroll-progress bar
- Drag-and-swipe photo carousel with full-screen viewer
- Sticky "inside the home" section that changes photo as you scroll
- Walk-through film that grows into view and plays silently while visible
- Bento details grid with glow-on-hover cards
- Enquiry form with copy-to-clipboard contact lines

## Structure
```
js/data.js        ALL content: name, URL, contact details, headline, properties   <-- edit this
build.js          generates the pages below
js/render.js      page templates (used by build.js)
js/app.js         carousel, viewer, scroll effects, share button, enquiry form, theme switch
css/style.css     design (colour tokens at the top, light and dark)
images/hero.jpg   home banner (wide, at least 2400 px)
images/<slug>/    1.jpg, 2.jpg ... per property (1.jpg = cover and share image)
video/            optional walk-through film (mp4)
index.html, about/, contact/, properties/, <slug>/, 404.html, sitemap.xml, robots.txt   (generated)
```

## Before deploying
1. Set `SITE.url` in `js/data.js` to the live domain (for example `"https://www.havenandkey.com"`), then run `node build.js`.
2. Replace the demo photos and text (see below).
3. Add the Web3Forms key so enquiries reach the client (see below).

## Replace the demo content
- **Text and numbers:** `js/data.js`. Anything showing "To be confirmed" needs a real value in `specs`, `beds`, `baths`, `area`, `plot`, `price` or `place`.
- **Photos:** overwrite `images/hero.jpg` and `images/<slug>/1.jpg ...` using the same names. Use JPEGs of 2400 px (hero) and 1800–2400 px (property photos), compressed to under about 600 KB each. Add or remove photos by editing the `photos` caption list (one caption per file).
- **Scrolling tour:** edit `tour` (title, text and which photo number to show). Remove `tour` to use the feature list instead.
- **Video (optional):** `video:` accepts a YouTube/Vimeo link or an mp4 path. Keep mp4 files under about 20 MB.
- **New property:** copy a block in `PROPERTIES`, change `slug`, add `images/<new-slug>/`, run `node build.js`. Maximum 3 are used.
- **Colours:** change the variables at the top of `css/style.css`.

## Enquiry form (email to the client)
1. Go to [web3forms.com](https://web3forms.com), enter the **client's email address** and create an Access Key (free).
2. Paste it into `web3formsKey` in `js/data.js`.
3. Send a test enquiry. A Formspree URL in `formEndpoint` also works.

## Deploy
```bash
git init && git add . && git commit -m "Initial site"
git branch -M main
git remote add origin <your-repo-url> && git push -u origin main
```
Connect the repository to Cloudflare Pages, Netlify or Vercel (no build command, publish directory is the repository root), or use GitHub Pages (Settings > Pages > branch `main`, root).
