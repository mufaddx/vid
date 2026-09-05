import { Document, renderToBuffer, View, StyleSheet } from "@react-pdf/renderer";
import { Text } from "./Text";
import type { CompanySettings } from "@prisma/client";
import { LetterheadPage } from "@/lib/pdf/Letterhead";
import { DocTitle, MetaRow } from "@/lib/pdf/blocks";
import { formatDate, formatINR } from "@/lib/format";
import { pdfTheme } from "@/lib/pdf/theme";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: pdfTheme.colors.border,
  },
  rowLabel: { fontSize: 9.5, color: pdfTheme.colors.muted },
  rowValue: { fontSize: 9.5, fontFamily: pdfTheme.fontBold },
  emphRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: pdfTheme.colors.ink,
  },
  emphLabel: { fontSize: 10.5, fontFamily: pdfTheme.fontBold },
  emphValue: { fontSize: 13, fontFamily: pdfTheme.fontBold, color: pdfTheme.colors.accent },
  section: { marginTop: 18, marginBottom: 6, fontSize: 8, color: pdfTheme.colors.muted, letterSpacing: 1 },
});

export type PayoutStatementPdfInput = {
  company: CompanySettings;
  payoutNumber: string;
  creatorName: string;
  campaignName?: string;
  campaignValue: number;
  commissionPercentage: number;
  commissionAmount: number;
  creatorShare: number;
  paidAmount: number;
  pendingAmount: number;
  paymentDate?: Date | null;
  transactionReference?: string | null;
};

function PayoutStatementDocument({ input }: { input: PayoutStatementPdfInput }) {
  return (
    <Document>
      <LetterheadPage company={input.company}>
        <DocTitle>CREATOR PAYOUT STATEMENT</DocTitle>
        <MetaRow
          items={[
            { label: "Payout No.", value: input.payoutNumber },
            { label: "Creator", value: input.creatorName },
            ...(input.campaignName ? [{ label: "Campaign", value: input.campaignName }] : []),
          ]}
        />

        <Text style={styles.section}>CAMPAIGN VALUE</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Gross Campaign Value</Text>
          <Text style={styles.rowValue}>{formatINR(input.campaignValue)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>VIDLIX Commission ({input.commissionPercentage}%)</Text>
          <Text style={styles.rowValue}>{formatINR(input.commissionAmount)}</Text>
        </View>
        <View style={styles.emphRow}>
          <Text style={styles.emphLabel}>Creator Share</Text>
          <Text style={styles.emphValue}>{formatINR(input.creatorShare)}</Text>
        </View>

        <Text style={styles.section}>PAYMENT STATUS</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Paid</Text>
          <Text style={styles.rowValue}>{formatINR(input.paidAmount)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Balance</Text>
          <Text style={styles.rowValue}>{formatINR(input.pendingAmount)}</Text>
        </View>
        {input.paymentDate ? (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Payment Date</Text>
            <Text style={styles.rowValue}>{formatDate(input.paymentDate)}</Text>
          </View>
        ) : null}
        {input.transactionReference ? (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Payment Reference</Text>
            <Text style={styles.rowValue}>{input.transactionReference}</Text>
          </View>
        ) : null}
      </LetterheadPage>
    </Document>
  );
}

export async function renderPayoutStatementPdf(input: PayoutStatementPdfInput): Promise<Buffer> {
  return renderToBuffer(<PayoutStatementDocument input={input} />);
}
