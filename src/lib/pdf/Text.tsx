import { Text as PdfText } from "@react-pdf/renderer";
import type { ComponentProps, ReactNode } from "react";

// NotoSans (like most fonts) ligature-substitutes "fi"/"fl"/"ff" into a
// single glyph. react-pdf's text layout engine then loses the second
// letter when it lays that glyph back out — "conflicts" renders as
// "conficts", "first" as "frst", "affect" as "afect". A zero-width
// non-joiner between the letters is invisible but blocks the ligature
// substitution outright, so we thread every string through it here
// instead of patching every call site.
const ZWNJ = "‌";
function breakLigatures(text: string): string {
  return text.replace(/f(?=[fil])/g, `f${ZWNJ}`);
}

function sanitize(node: ReactNode): ReactNode {
  if (typeof node === "string") return breakLigatures(node);
  if (Array.isArray(node)) return node.map(sanitize);
  return node;
}

type PdfTextProps = ComponentProps<typeof PdfText>;
// react-pdf's Text props type is a union with an SVG variant that doesn't
// declare `children`/`render`; this wrapper only ever targets plain
// document Text, so narrow it explicitly rather than fight the union.
type PlainTextProps = PdfTextProps & {
  children?: ReactNode;
  render?: (params: { pageNumber: number; totalPages: number }) => string;
};

export function Text(props: PdfTextProps) {
  const { children, render, ...rest } = props as PlainTextProps;
  // react-pdf checks for the presence of a `render` prop, not just its
  // truthiness — passing `render={undefined}` still trips it ("node.props
  // .render is not a function"), so the key must be omitted entirely when
  // there's no dynamic render function.
  if (render) {
    return <PdfText {...rest} render={(params) => breakLigatures(String(render(params)))} />;
  }
  return <PdfText {...rest}>{sanitize(children)}</PdfText>;
}
