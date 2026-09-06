// Drop-in replacement for @react-pdf/hyphenate/en-us, aliased in via
// next.config.ts's webpack() resolve.alias.
//
// @react-pdf/textkit statically imports `{ syllables } from
// "@react-pdf/hyphenate/en-us"` to auto-hyphenate wrapped text. That
// package (react-pdf's own, published as a single "0.1.0" with no newer
// release available) declares only an "import" condition in its
// package.json "exports" map — there is no "require" condition, not even
// for its "./*" wildcard. Any require()-based resolution of that subpath
// (which is exactly what happens for a Node.js server bundle in some
// runtime/module configurations) throws
// ERR_PACKAGE_PATH_NOT_EXPORTED, taking down PDF generation entirely.
//
// We don't need automatic word-splitting in a legal contract/invoice
// layout anyway, so this shim just reports every word as one unsplit
// syllable — text still wraps normally at spaces, it simply never
// hyphenates mid-word. See createHyphenator() in
// @react-pdf/hyphenate/lib/index.js for the shape this mirrors.
function syllables(word) {
  return [word];
}

function hyphenate(word) {
  return word;
}

module.exports = { syllables, hyphenate, patterns: {} };
