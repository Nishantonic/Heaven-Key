#!/usr/bin/env node
/* Tiny local web server with clean addresses (no .html, no index.html), same as the live site.
   Run:  node serve.js     then open http://localhost:8000/ */
const http = require("http"), fs = require("fs"), path = require("path");
const root = __dirname, port = process.env.PORT || 8000;
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".xml": "application/xml", ".txt": "text/plain" };
http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split("?")[0]); let f = path.join(root, p);
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (p.endsWith("/index.html")) { res.writeHead(301, { Location: p.slice(0, -10) }); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) { if (!p.endsWith("/")) { res.writeHead(301, { Location: p + "/" }); return res.end(); } f = path.join(f, "index.html"); }
  if (!fs.existsSync(f)) { res.writeHead(404, { "Content-Type": types[".html"] }); return res.end(fs.readFileSync(path.join(root, "404.html"))); }
  const size = fs.statSync(f).size, type = types[path.extname(f)] || "application/octet-stream", m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || "");
  if (m) { const s = m[1] ? +m[1] : 0, e = m[2] ? +m[2] : size - 1; res.writeHead(206, { "Content-Type": type, "Content-Range": `bytes ${s}-${e}/${size}`, "Accept-Ranges": "bytes", "Content-Length": e - s + 1 }); fs.createReadStream(f, { start: s, end: e }).pipe(res); }
  else { res.writeHead(200, { "Content-Type": type, "Content-Length": size, "Accept-Ranges": "bytes" }); fs.createReadStream(f).pipe(res); }
}).listen(port, () => console.log(`Open http://localhost:${port}/   (Ctrl+C to stop)`));
