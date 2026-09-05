// Shared PDF theme — one consistent typeface and palette across every
// generated document (spec §49, §52: don't over-design legal documents,
// keep them readable).

export const pdfTheme = {
  colors: {
    ink: "#111827",
    muted: "#6b7280",
    accent: "#6D28D9",
    border: "#e5e7eb",
    faint: "#f5f3ff",
  },
  font: "Helvetica",
  fontBold: "Helvetica-Bold",
};
