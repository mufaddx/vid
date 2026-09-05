import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { CompanySettings } from "@prisma/client";
import { pdfTheme } from "@/lib/pdf/theme";
import type { ReactNode } from "react";

const styles = StyleSheet.create({
  page: {
    paddingTop: 130,
    paddingBottom: 70,
    paddingHorizontal: 44,
    fontFamily: pdfTheme.font,
    fontSize: 10.5,
    color: pdfTheme.colors.ink,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 32,
    paddingHorizontal: 44,
    paddingBottom: 16,
  },
  brand: {
    fontFamily: pdfTheme.fontBold,
    fontSize: 20,
    color: pdfTheme.colors.ink,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 7.5,
    color: pdfTheme.colors.accent,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  headerRight: {
    fontSize: 8.5,
    color: pdfTheme.colors.muted,
    textAlign: "right",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: pdfTheme.colors.border,
    marginTop: 14,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 44,
    right: 44,
    borderTopWidth: 1,
    borderTopColor: pdfTheme.colors.border,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: pdfTheme.colors.muted,
  },
});

export function LetterheadPage({
  company,
  children,
}: {
  company: CompanySettings;
  children: ReactNode;
}) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header} fixed>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>{company.companyName.toUpperCase()}</Text>
            <Text style={styles.tagline}>{company.tagline}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text>{company.email}</Text>
            <Text>{company.website}</Text>
            <Text>{company.phone}</Text>
          </View>
        </View>
        <View style={styles.divider} />
      </View>

      {children}

      <View style={styles.footer} fixed>
        <Text>
          {company.legalName}
          {company.gstin ? `  ·  GSTIN ${company.gstin}` : ""}
        </Text>
        <Text
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      </View>
    </Page>
  );
}
