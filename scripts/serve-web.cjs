/* global __dirname */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../dist");
const types = {
  ".js": "text/javascript",
  ".wasm": "application/wasm",
  ".html": "text/html",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".json": "application/json",
};
http
  .createServer((req, res) => {
    res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    const requestPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const target = path.resolve(root, "." + requestPath);
    if (!target.startsWith(root + path.sep) && target !== root) {
      res.writeHead(403);
      res.end();
      return;
    }
    const file =
      fs.existsSync(target) && fs.statSync(target).isFile()
        ? target
        : path.join(root, "index.html");
    res.setHeader(
      "Content-Type",
      types[path.extname(file)] || "application/octet-stream",
    );
    fs.createReadStream(file).pipe(res);
  })
  .listen(8081, "127.0.0.1", () =>
    console.log("Formula Learner preview: http://127.0.0.1:8081"),
  );
