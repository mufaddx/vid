import { Page, View, StyleSheet, Font } from "@react-pdf/renderer";
import { Text } from "./Text";
import type { CompanySettings } from "@prisma/client";
import { pdfTheme } from "@/lib/pdf/theme";
import { SOCIAL_ICONS } from "@/lib/pdf/social-icons";
import { VidlixWordmark } from "@/lib/pdf/wordmark";
import type { ReactNode } from "react";

// Belt-and-suspenders alongside the webpack alias in next.config.ts (the
// actual fix for @react-pdf/hyphenate's broken package "exports" map —
// see the comment there for the full story): explicitly telling
// react-pdf to never split a word keeps every PDF route's behavior
// correct even if the hyphenation codepath is ever reached some other
// way. Word-wrapping at spaces is unaffected — this only disables
// mid-word splitting, which a legal/financial document doesn't need.
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    paddingTop: 152,
    paddingBottom: 78,
    paddingHorizontal: 44,
    fontFamily: pdfTheme.font,
    fontSize: 10.5,
    color: pdfTheme.colors.ink,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: pdfTheme.colors.accent,
  },
  watermark: {
    position: "absolute",
    top: 400,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 90,
    fontFamily: pdfTheme.fontBold,
    color: "rgba(109, 40, 217, 0.05)",
    letterSpacing: 4,
    transform: "rotate(-32deg)",
  },
  header: {
    position: "absolute",
    top: 6,
    left: 0,
    right: 0,
    paddingTop: 26,
    paddingHorizontal: 44,
    paddingBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brandRow: {
    flexDirection: "column",
  },
  tagline: {
    fontSize: 7.5,
    color: pdfTheme.colors.accent,
    letterSpacing: 1.5,
    marginTop: 3,
  },
  headerRight: {
    fontSize: 8.5,
    color: pdfTheme.colors.muted,
    textAlign: "right",
    lineHeight: 1.5,
  },
  headerRightStrong: {
    color: pdfTheme.colors.ink,
    fontFamily: pdfTheme.fontBold,
  },
  divider: {
    height: 2,
    backgroundColor: pdfTheme.colors.accent,
    marginTop: 16,
    borderRadius: 1,
  },
  serviceStrip: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: pdfTheme.colors.faintBorder,
    fontSize: 6.5,
    color: pdfTheme.colors.accentSoft,
    letterSpacing: 1,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 44,
    paddingBottom: 18,
    paddingTop: 16,
  },
  footerDivider: {
    height: 1.5,
    backgroundColor: pdfTheme.colors.accent,
    opacity: 0.35,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 7.5,
    color: pdfTheme.colors.muted,
  },
  footerSocialRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  socialItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  socialLabel: {
    fontSize: 6.5,
    color: pdfTheme.colors.muted,
    marginLeft: 3,
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
      <View style={styles.topBar} fixed />
      <Text style={styles.watermark} fixed>
        VIDLIX
      </Text>

      <View style={styles.header} fixed>
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <VidlixWordmark size={26} />
            <Text style={styles.tagline}>{company.tagline}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerRightStrong}>{company.email}</Text>
            <Text>{company.website.replace(/^https?:\/\//, "")}</Text>
            <Text>{company.phone}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <Text style={styles.serviceStrip}>
          INFLUENCER MANAGEMENT · BRAND COLLABORATIONS · CONTENT STRATEGY · TALENT GROWTH
        </Text>
      </View>

      {children}

      <View style={styles.footer} fixed>
        <View style={styles.footerDivider} />
        <View style={styles.footerRow}>
          <View style={styles.footerSocialRow}>
            {SOCIAL_ICONS.map(({ Icon, label }) => (
              <View key={label} style={styles.socialItem}>
                <Icon size={9} color={pdfTheme.colors.accent} />
                <Text style={styles.socialLabel}>{company.website.replace(/^https?:\/\//, "")}</Text>
              </View>
            ))}
          </View>
          <Text
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </View>
    </Page>
  );
}
