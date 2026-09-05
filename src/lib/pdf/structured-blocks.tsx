import { View, StyleSheet } from "@react-pdf/renderer";
import { Text } from "./Text";
import { pdfTheme } from "@/lib/pdf/theme";

// Compact building blocks shared by the two structured, single-page
// agreement PDFs (Creator Management / Brand Collaboration). Deliberately
// tighter than the general-purpose blocks.tsx (smaller type, thinner
// padding) — these documents must fit one A4 page (spec §6).

const styles = StyleSheet.create({
  docTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  docTitleBar: { width: 3.5, height: 15, backgroundColor: pdfTheme.colors.accent, borderRadius: 2, marginRight: 7 },
  docTitle: { fontSize: 13, fontFamily: pdfTheme.fontBold, letterSpacing: 0.4, color: pdfTheme.colors.ink },

  relationshipBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: pdfTheme.colors.accentDark,
    borderRadius: 6,
    paddingVertical: 6,
    marginBottom: 10,
  },
  relationshipParty: { fontSize: 9, fontFamily: pdfTheme.fontBold, color: "#ffffff" },
  relationshipSep: { fontSize: 9, fontFamily: pdfTheme.fontBold, color: pdfTheme.colors.accentSoft, marginHorizontal: 8 },

  metaBlock: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: pdfTheme.colors.faint,
    borderWidth: 1,
    borderColor: pdfTheme.colors.faintBorder,
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginBottom: 9,
  },
  metaLabel: { fontSize: 6, color: pdfTheme.colors.accent, marginBottom: 2, letterSpacing: 0.5 },
  metaValue: { fontSize: 9, fontFamily: pdfTheme.fontBold, color: pdfTheme.colors.ink },

  sectionLabel: {
    fontSize: 7.5,
    fontFamily: pdfTheme.fontBold,
    color: pdfTheme.colors.accent,
    letterSpacing: 0.6,
    marginTop: 8,
    marginBottom: 4,
  },

  infoStrip: {
    backgroundColor: pdfTheme.colors.faint,
    borderWidth: 1,
    borderColor: pdfTheme.colors.faintBorder,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  infoStripLabel: { fontSize: 6.5, fontFamily: pdfTheme.fontBold, color: pdfTheme.colors.accent, letterSpacing: 0.4, marginBottom: 3 },
  infoStripValues: { flexDirection: "row", flexWrap: "wrap" },
  infoStripItem: { marginRight: 16, marginBottom: 2 },
  infoStripValue: { fontSize: 8.5, color: pdfTheme.colors.ink },

  table: { borderWidth: 1, borderColor: pdfTheme.colors.faintBorder, borderRadius: 4, overflow: "hidden" },
  tableHeaderRow: { flexDirection: "row", backgroundColor: pdfTheme.colors.faint, paddingVertical: 4, paddingHorizontal: 8 },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: pdfTheme.colors.faintBorder,
  },
  th: { fontSize: 6.5, fontFamily: pdfTheme.fontBold, color: pdfTheme.colors.accent, letterSpacing: 0.3 },
  td: { fontSize: 8.5, color: pdfTheme.colors.ink },
  tdMuted: { fontSize: 8.5, color: pdfTheme.colors.muted },

  paragraph: { fontSize: 8.5, lineHeight: 1.45, color: pdfTheme.colors.ink, textAlign: "justify" },

  totalsBlock: { marginTop: 6, alignItems: "flex-end" },
  totalsRow: { flexDirection: "row", width: 200, justifyContent: "space-between", paddingVertical: 1.5 },
  totalsLabel: { fontSize: 8.5, color: pdfTheme.colors.muted },
  totalsValue: { fontSize: 8.5, color: pdfTheme.colors.ink },
  grandTotalRow: {
    flexDirection: "row",
    width: 200,
    justifyContent: "space-between",
    paddingVertical: 4,
    marginTop: 2,
    borderTopWidth: 1,
    borderTopColor: pdfTheme.colors.ink,
  },
  grandTotalLabel: { fontSize: 9.5, fontFamily: pdfTheme.fontBold, color: pdfTheme.colors.ink },
  grandTotalValue: { fontSize: 10.5, fontFamily: pdfTheme.fontBold, color: pdfTheme.colors.accent },

  signatureRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, gap: 8 },
  signatureBox: {
    flex: 1,
    backgroundColor: pdfTheme.colors.faint,
    borderWidth: 1,
    borderColor: pdfTheme.colors.faintBorder,
    borderRadius: 6,
    padding: 8,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: pdfTheme.colors.accentSoft,
    height: 26,
    marginBottom: 4,
    justifyContent: "flex-end",
  },
  signatureLabel: { fontSize: 6.5, color: pdfTheme.colors.muted },
  signatureName: { fontSize: 8.5, fontFamily: pdfTheme.fontBold, marginTop: 1, color: pdfTheme.colors.ink },
});

export function StructuredDocTitle({ children }: { children: string }) {
  return (
    <View style={styles.docTitleRow}>
      <View style={styles.docTitleBar} />
      <Text style={styles.docTitle}>{children}</Text>
    </View>
  );
}

export function RelationshipBar({ parties }: { parties: string[] }) {
  return (
    <View style={styles.relationshipBar}>
      {parties.map((party, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
          {i > 0 ? <Text style={styles.relationshipSep}>×</Text> : null}
          <Text style={styles.relationshipParty}>{party.toUpperCase()}</Text>
        </View>
      ))}
    </View>
  );
}

export function StructuredMetaRow({ items }: { items: { label: string; value: string }[] }) {
  return (
    <View style={styles.metaBlock}>
      {items.map((item) => (
        <View key={item.label}>
          <Text style={styles.metaLabel}>{item.label.toUpperCase()}</Text>
          <Text style={styles.metaValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children.toUpperCase()}</Text>;
}

// A single compact bar for short factual line-items (e.g. connected social
// handles) — used instead of a full DataTable where a whole section/table
// would cost more vertical space than the one-page budget allows.
export function InfoStrip({ label, items }: { label: string; items: string[] }) {
  return (
    <View style={styles.infoStrip}>
      <Text style={styles.infoStripLabel}>{label.toUpperCase()}</Text>
      <View style={styles.infoStripValues}>
        {items.map((item, i) => (
          <Text key={i} style={[styles.infoStripValue, styles.infoStripItem]}>
            {item}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function StructuredParagraph({ children }: { children: string }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

export function DataTable({
  columns,
  rows,
}: {
  columns: { key: string; label: string; width?: number | string; align?: "left" | "right" }[];
  rows: Record<string, string>[];
}) {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeaderRow}>
        {columns.map((col) => (
          <Text
            key={col.key}
            style={[styles.th, { width: col.width ?? undefined, flex: col.width ? undefined : 1, textAlign: col.align ?? "left" }]}
          >
            {col.label.toUpperCase()}
          </Text>
        ))}
      </View>
      {rows.map((row, i) => (
        <View key={i} style={styles.tableRow}>
          {columns.map((col) => (
            <Text
              key={col.key}
              style={[styles.td, { width: col.width ?? undefined, flex: col.width ? undefined : 1, textAlign: col.align ?? "left" }]}
            >
              {row[col.key] ?? ""}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

export function StructuredTotals({
  subtotal,
  tax,
  total,
  formatAmount,
}: {
  subtotal: number;
  tax: number;
  total: number;
  formatAmount: (n: number) => string;
}) {
  return (
    <View style={styles.totalsBlock}>
      <View style={styles.totalsRow}>
        <Text style={styles.totalsLabel}>Subtotal</Text>
        <Text style={styles.totalsValue}>{formatAmount(subtotal)}</Text>
      </View>
      {tax > 0 ? (
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Tax</Text>
          <Text style={styles.totalsValue}>{formatAmount(tax)}</Text>
        </View>
      ) : null}
      <View style={styles.grandTotalRow}>
        <Text style={styles.grandTotalLabel}>Grand Total</Text>
        <Text style={styles.grandTotalValue}>{formatAmount(total)}</Text>
      </View>
    </View>
  );
}

export function StructuredSignatureRow({
  signers,
}: {
  signers: { label: string; name?: string; imageDataUri?: string; date?: string }[];
}) {
  return (
    <View style={styles.signatureRow} wrap={false}>
      {signers.map((sig, i) => (
        <View key={i} style={styles.signatureBox}>
          <View style={styles.signatureLine}>
            {sig.name ? (
              <Text style={{ fontSize: 9, fontFamily: pdfTheme.fontOblique, color: pdfTheme.colors.accentDark }}>{sig.name}</Text>
            ) : null}
          </View>
          <Text style={styles.signatureLabel}>{sig.label}</Text>
          {sig.date ? <Text style={styles.signatureLabel}>{sig.date}</Text> : null}
        </View>
      ))}
    </View>
  );
}

export const structuredPdfStyles = styles;
