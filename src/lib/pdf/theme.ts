import path from "path";
import { Font } from "@react-pdf/renderer";

// Helvetica (react-pdf's built-in base-14 font) has no ₹ glyph — it silently
// substitutes a superscript "1", which is exactly what showed up on every
// generated PDF. Noto Sans covers the Indian Rupee sign, so we register it
// once here — as three separate families (mirroring the old
// Helvetica/Helvetica-Bold/Helvetica-Oblique naming) so every existing
// `fontFamily: pdfTheme.fontBold` etc. call site keeps working unchanged.
let registered = false;
function registerFonts() {
  if (registered) return;
  registered = true;
  const dir = path.join(process.cwd(), "assets", "fonts");
  Font.register({ family: "NotoSans", src: path.join(dir, "NotoSans-Regular.ttf") });
  Font.register({ family: "NotoSans-Bold", src: path.join(dir, "NotoSans-Bold.ttf") });
  Font.register({ family: "NotoSans-Italic", src: path.join(dir, "NotoSans-Italic.ttf") });
}
registerFonts();

export const pdfTheme = {
  colors: {
    ink: "#111827",
    muted: "#6b7280",
    accent: "#6D28D9",
    accentDark: "#4C1D95",
    accentSoft: "#A78BFA",
    border: "#e5e7eb",
    faint: "#F5F3FF",
    faintBorder: "#EDE9FE",
  },
  font: "NotoSans",
  fontBold: "NotoSans-Bold",
  fontOblique: "NotoSans-Italic",
};
