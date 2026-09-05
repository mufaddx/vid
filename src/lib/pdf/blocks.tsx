import { View, Image, StyleSheet } from "@react-pdf/renderer";
import { Text } from "./Text";
import { pdfTheme } from "@/lib/pdf/theme";
import type { AgreementSection } from "@/lib/agreement-content";

const styles = StyleSheet.create({
  metaBlock: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: pdfTheme.colors.faint,
    borderWidth: 1,
    borderColor: pdfTheme.colors.faintBorder,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 22,
  },
  metaLabel: {
    fontSize: 7,
    color: pdfTheme.colors.accent,
    marginBottom: 3,
    letterSpacing: 0.6,
  },
  metaValue: { fontSize: 11, fontFamily: pdfTheme.fontBold, color: pdfTheme.colors.ink },
  docTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  docTitleBar: {
    width: 4,
    height: 20,
    backgroundColor: pdfTheme.colors.accent,
    borderRadius: 2,
    marginRight: 9,
  },
  docTitle: {
    fontSize: 16,
    fontFamily: pdfTheme.fontBold,
    letterSpacing: 0.6,
    color: pdfTheme.colors.ink,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 7,
  },
  headingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: pdfTheme.colors.accent,
    marginRight: 7,
  },
  heading: {
    fontSize: 11,
    fontFamily: pdfTheme.fontBold,
    color: pdfTheme.colors.ink,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 6,
    color: pdfTheme.colors.ink,
    textAlign: "justify",
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 36,
  },
  signatureBox: {
    width: "45%",
    backgroundColor: pdfTheme.colors.faint,
    borderWidth: 1,
    borderColor: pdfTheme.colors.faintBorder,
    borderRadius: 8,
    padding: 12,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: pdfTheme.colors.accentSoft,
    height: 40,
    marginBottom: 6,
    justifyContent: "flex-end",
  },
  signatureLabel: { fontSize: 7.5, color: pdfTheme.colors.muted },
  signatureName: { fontSize: 10, fontFamily: pdfTheme.fontBold, marginTop: 2, color: pdfTheme.colors.ink },
});

export function DocTitle({ children }: { children: string }) {
  return (
    <View style={styles.docTitleRow}>
      <View style={styles.docTitleBar} />
      <Text style={styles.docTitle}>{children}</Text>
    </View>
  );
}

export function MetaRow({ items }: { items: { label: string; value: string }[] }) {
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

/** Renders agreement sections; a lone "---" paragraph forces a page break. */
export function SectionBlocks({ sections }: { sections: AgreementSection[] }) {
  return (
    <>
      {sections.map((section) => {
        const paragraphs = section.body.split("\n\n").filter((p) => p.trim().length > 0);
        return (
          <View key={section.id} wrap>
            <View style={styles.headingRow}>
              <View style={styles.headingDot} />
              <Text style={styles.heading}>{section.heading}</Text>
            </View>
            {paragraphs.map((para, i) =>
              para.trim() === "---" ? (
                <View key={i} break />
              ) : (
                <Text key={i} style={styles.paragraph}>
                  {para.trim()}
                </Text>
              ),
            )}
          </View>
        );
      })}
    </>
  );
}

export function SignatureBlock({
  left,
  right,
}: {
  left: { label: string; name?: string; imageDataUri?: string; date?: string };
  right: { label: string; name?: string; imageDataUri?: string; date?: string };
}) {
  return (
    <View style={styles.signatureRow} wrap={false}>
      {[left, right].map((sig, i) => (
        <View key={i} style={styles.signatureBox}>
          <View style={styles.signatureLine}>
            {sig.imageDataUri ? (
              <Image src={sig.imageDataUri} style={{ height: 34, objectFit: "contain" }} />
            ) : sig.name ? (
              <Text style={{ fontSize: 12, fontFamily: pdfTheme.fontOblique, color: pdfTheme.colors.accentDark }}>
                {sig.name}
              </Text>
            ) : null}
          </View>
          <Text style={styles.signatureLabel}>{sig.label}</Text>
          {sig.name ? <Text style={styles.signatureName}>{sig.name}</Text> : null}
          {sig.date ? <Text style={styles.signatureLabel}>{sig.date}</Text> : null}
        </View>
      ))}
    </View>
  );
}

export const pdfBlockStyles = styles;
