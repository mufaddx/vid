import { Document, renderToBuffer, View, StyleSheet } from "@react-pdf/renderer";
import { Text } from "./Text";
import type { CompanySettings } from "@prisma/client";
import { LetterheadPage } from "@/lib/pdf/Letterhead";
import { DocTitle, MetaRow, pdfBlockStyles } from "@/lib/pdf/blocks";
import { formatDate, formatINR } from "@/lib/format";
import { pdfTheme } from "@/lib/pdf/theme";

const styles = StyleSheet.create({
  billTo: { marginTop: 4, marginBottom: 20 },
  billToLabel: { fontSize: 8, color: pdfTheme.colors.muted, marginBottom: 3 },
  billToName: { fontSize: 12, fontFamily: pdfTheme.fontBold },
  table: { borderTopWidth: 1, borderTopColor: pdfTheme.colors.border, marginTop: 8 },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: pdfTheme.colors.faint,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: pdfTheme.colors.border,
  },
  colDesc: { flex: 1, fontSize: 9.5 },
  colAmount: { width: 110, fontSize: 9.5, textAlign: "right" },
  headerText: { fontSize: 8, fontFamily: pdfTheme.fontBold, color: pdfTheme.colors.muted },
  totalsBlock: { marginTop: 12, alignItems: "flex-end" },
  totalsRow: { flexDirection: "row", width: 220, justifyContent: "space-between", paddingVertical: 3 },
  totalsLabel: { fontSize: 9.5, color: pdfTheme.colors.muted },
  totalsValue: { fontSize: 9.5 },
  grandTotalRow: {
    flexDirection: "row",
    width: 220,
    justifyContent: "space-between",
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: pdfTheme.colors.ink,
    marginTop: 4,
  },
  grandTotalLabel: { fontSize: 10.5, fontFamily: pdfTheme.fontBold },
  grandTotalValue: { fontSize: 12, fontFamily: pdfTheme.fontBold, color: pdfTheme.colors.accent },
  statusBadge: {
    marginTop: 16,
    alignSelf: "flex-start",
    fontSize: 9,
    fontFamily: pdfTheme.fontBold,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: pdfTheme.colors.ink,
  },
});

export type InvoicePdfInput = {
  company: CompanySettings;
  invoiceNumber: string;
  invoiceTypeLabel: string;
  issueDate: Date;
  dueDate: Date;
  billToName: string;
  billToSubtitle?: string;
  lineItems: { description: string; amount: number }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
};

function InvoiceDocument({ input }: { input: InvoicePdfInput }) {
  return (
    <Document>
      <LetterheadPage company={input.company}>
        <DocTitle>{input.invoiceTypeLabel.toUpperCase()}</DocTitle>
        <MetaRow
          items={[
            { label: "Invoice No.", value: input.invoiceNumber },
            { label: "Invoice Date", value: formatDate(input.issueDate) },
            { label: "Due Date", value: formatDate(input.dueDate) },
          ]}
        />
        <View style={styles.billTo}>
          <Text style={styles.billToLabel}>BILL TO</Text>
          <Text style={styles.billToName}>{input.billToName}</Text>
          {input.billToSubtitle ? (
            <Text style={pdfBlockStyles.paragraph}>{input.billToSubtitle}</Text>
          ) : null}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colDesc, styles.headerText]}>DESCRIPTION</Text>
            <Text style={[styles.colAmount, styles.headerText]}>AMOUNT</Text>
          </View>
          {input.lineItems.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colAmount}>{formatINR(item.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{formatINR(input.subtotal)}</Text>
          </View>
          {input.tax > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Tax</Text>
              <Text style={styles.totalsValue}>{formatINR(input.tax)}</Text>
            </View>
          )}
          {input.discount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Discount</Text>
              <Text style={styles.totalsValue}>-{formatINR(input.discount)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatINR(input.total)}</Text>
          </View>
        </View>

        <Text style={styles.statusBadge}>{input.status}</Text>
      </LetterheadPage>
    </Document>
  );
}

export async function renderInvoicePdf(input: InvoicePdfInput): Promise<Buffer> {
  return renderToBuffer(<InvoiceDocument input={input} />);
}
