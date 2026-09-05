// Custom production server — required for Hostinger's shared-hosting
// "Node.js App" feature (Passenger), which runs this file directly and
// expects it to start an HTTP server listening on process.env.PORT.
// `next start` (the normal production command) is a CLI wrapper Passenger
// can't drive this way, so we use Next's programmatic API instead.
// See: node_modules/next/dist/docs/01-app/02-guides/custom-server.md
const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, () => {
    console.log(`> VIDLIX ready on port ${port} (${dev ? "development" : "production"})`);
  });
});
