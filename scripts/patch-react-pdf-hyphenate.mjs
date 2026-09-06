// Runs automatically after every `npm install` (see package.json's
// "postinstall" script) — including Hostinger's own build, which runs
// its own npm install with no way for us to intervene otherwise.
//
// @react-pdf/hyphenate (a dependency of @react-pdf/renderer, used to
// auto-hyphenate wrapped text) ships "type": "module" and a
// package.json "exports" map that declares ONLY an "import" condition —
// there is no "require" condition, not even for its "./*" wildcard. This
// is a real gap in its one and only published version (0.1.0).
//
// @react-pdf/renderer is on Next.js's own default serverExternalPackages
// list, so Next deliberately does NOT bundle it (or anything it
// requires) for Route Handlers — it's left as a plain Node.js
// `require("@react-pdf/hyphenate/en-us")` resolved straight against the
// real installed package at actual runtime. Node's conditional-exports
// resolver checks for a "require" condition on that live require() call,
// finds none, and refuses with ERR_PACKAGE_PATH_NOT_EXPORTED — taking
// down PDF generation entirely. This only surfaces on newer Node
// releases (confirmed: reproduces on production's Node 22, not on this
// project's Node 20 dev container) because require()-ing a synchronous
// ES module is a newer Node capability (stable Node 20.19+ / 22.12+) —
// older Node just doesn't attempt that resolution path the same way.
//
// The fix: add a "require" condition pointing at the exact same files.
// The actual JS in those files is plain synchronous ESM (a handful of
// `export { ... }` statements, no top-level await, no CJS-incompatible
// features), which Node's newer require(esm) support loads directly —
// once the exports map actually allows a "require" condition to match.
import { existsSync, readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const pkgPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "node_modules/@react-pdf/hyphenate/package.json",
);

if (!existsSync(pkgPath)) {
  // Not installed (e.g. a partial/offline install) — nothing to patch.
  process.exit(0);
}

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const exportsMap = pkg.exports;

if (!exportsMap || typeof exportsMap !== "object") {
  console.warn("[patch-react-pdf-hyphenate] unexpected package.json shape, skipping.");
  process.exit(0);
}

let changed = false;
for (const key of Object.keys(exportsMap)) {
  const entry = exportsMap[key];
  if (entry && typeof entry === "object" && "import" in entry && !("require" in entry)) {
    entry.require = entry.import;
    changed = true;
  }
}

if (changed) {
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log("[patch-react-pdf-hyphenate] added missing \"require\" export conditions.");
} else {
  console.log("[patch-react-pdf-hyphenate] already patched (or nothing to patch) — no changes.");
}
