import { Document, renderToBuffer, View, StyleSheet } from "@react-pdf/renderer";
import { Text } from "./Text";
import type { CompanySettings } from "@prisma/client";
import { LetterheadPage } from "@/lib/pdf/Letterhead";
import { DocTitle, MetaRow } from "@/lib/pdf/blocks";
import { formatDate, formatINR } from "@/lib/format";
import { pdfTheme } from "@/lib/pdf/theme";

const styles = StyleSheet.create({
  amountBlock: {
    marginTop: 24,
    marginBottom: 24,
    padding: 20,
    backgroundColor: pdfTheme.colors.faint,
    alignItems: "center",
  },
  amountLabel: { fontSize: 9, color: pdfTheme.colors.muted, marginBottom: 4 },
  amountValue: { fontSize: 24, fontFamily: pdfTheme.fontBold, color: pdfTheme.colors.accent },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: pdfTheme.colors.border,
  },
  rowLabel: { fontSize: 9.5, color: pdfTheme.colors.muted },
  rowValue: { fontSize: 9.5, fontFamily: pdfTheme.fontBold },
});

export type ReceiptPdfInput = {
  company: CompanySettings;
  receiptNumber: string;
  paymentDate: Date;
  receivedFrom: string;
  invoiceNumber: string;
  campaignName?: string;
  amount: number;
  method: string;
  transactionReference?: string;
};

function ReceiptDocument({ input }: { input: ReceiptPdfInput }) {
  return (
    <Document>
      <LetterheadPage company={input.company}>
        <DocTitle>PAYMENT RECEIPT</DocTitle>
        <MetaRow
          items={[
            { label: "Receipt No.", value: input.receiptNumber },
            { label: "Payment Date", value: formatDate(input.paymentDate) },
          ]}
        />

        <View style={styles.amountBlock}>
          <Text style={styles.amountLabel}>AMOUNT RECEIVED</Text>
          <Text style={styles.amountValue}>{formatINR(input.amount)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Received From</Text>
          <Text style={styles.rowValue}>{input.receivedFrom}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Invoice Number</Text>
          <Text style={styles.rowValue}>{input.invoiceNumber}</Text>
        </View>
        {input.campaignName ? (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Campaign</Text>
            <Text style={styles.rowValue}>{input.campaignName}</Text>
          </View>
        ) : null}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Payment Method</Text>
          <Text style={styles.rowValue}>{input.method}</Text>
        </View>
        {input.transactionReference ? (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Transaction Reference</Text>
            <Text style={styles.rowValue}>{input.transactionReference}</Text>
          </View>
        ) : null}
      </LetterheadPage>
    </Document>
  );
}

export async function renderReceiptPdf(input: ReceiptPdfInput): Promise<Buffer> {
  return renderToBuffer(<ReceiptDocument input={input} />);
}
