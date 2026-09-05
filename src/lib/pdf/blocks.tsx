import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "@/lib/pdf/theme";
import type { AgreementSection } from "@/lib/agreement-content";

const styles = StyleSheet.create({
  metaBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  metaLabel: { fontSize: 8, color: pdfTheme.colors.muted, marginBottom: 2 },
  metaValue: { fontSize: 11, fontFamily: pdfTheme.fontBold },
  docTitle: {
    fontSize: 15,
    fontFamily: pdfTheme.fontBold,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  heading: {
    fontSize: 11,
    fontFamily: pdfTheme.fontBold,
    marginTop: 14,
    marginBottom: 6,
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
  signatureBox: { width: "45%" },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: pdfTheme.colors.ink,
    height: 40,
    marginBottom: 4,
    justifyContent: "flex-end",
  },
  signatureLabel: { fontSize: 8, color: pdfTheme.colors.muted },
  signatureName: { fontSize: 10, fontFamily: pdfTheme.fontBold, marginTop: 2 },
});

export function DocTitle({ children }: { children: string }) {
  return <Text style={styles.docTitle}>{children}</Text>;
}

export function MetaRow({ items }: { items: { label: string; value: string }[] }) {
  return (
    <View style={styles.metaBlock}>
      {items.map((item) => (
        <View key={item.label}>
          <Text style={styles.metaLabel}>{item.label}</Text>
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
            <Text style={styles.heading}>{section.heading}</Text>
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
              <Text style={{ fontSize: 12, fontFamily: "Helvetica-Oblique" }}>{sig.name}</Text>
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
