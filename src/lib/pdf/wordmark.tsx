import { Text } from "./Text";
import { pdfTheme } from "@/lib/pdf/theme";

// Recreated VIDLIX wordmark (bold, violet-accented X) — a close visual
// match to the brand logo, standing in until the actual logo file is
// dropped into assets/logo/ and wired in here in its place.
export function VidlixWordmark({
  size = 24,
  color = pdfTheme.colors.ink,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Text style={{ fontFamily: pdfTheme.fontBold, fontSize: size, letterSpacing: 0.5, color }}>
      VIDLI
      <Text style={{ color: pdfTheme.colors.accent }}>X</Text>
    </Text>
  );
}
