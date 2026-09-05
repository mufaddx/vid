import { Svg, Path, Circle, Rect, Polygon } from "@react-pdf/renderer";

// Small, simplified vector glyphs for the letterhead footer — recognizable
// shapes (not exact trademarked artwork) so the footer reads as real
// platform icons rather than plain text initials.

export function FacebookIcon({ size = 9, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={12} fill={color} />
      <Path
        d="M13.8 21v-7.6h2.6l.4-3h-3V8.5c0-.87.24-1.46 1.49-1.46h1.6V4.35c-.28-.04-1.22-.12-2.32-.12-2.3 0-3.87 1.4-3.87 3.98v2.19H8.7v3h2.1V21h3z"
        fill="#ffffff"
      />
    </Svg>
  );
}

export function InstagramIcon({ size = 9, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={2} y={2} width={20} height={20} rx={6} fill="none" stroke={color} strokeWidth={2} />
      <Circle cx={12} cy={12} r={5} fill="none" stroke={color} strokeWidth={2} />
      <Circle cx={17.3} cy={6.7} r={1.3} fill={color} />
    </Svg>
  );
}

export function YoutubeIcon({ size = 9, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={1} y={5} width={22} height={14} rx={4} fill={color} />
      <Polygon points="10,9 16,12 10,15" fill="#ffffff" />
    </Svg>
  );
}

export function XIcon({ size = 9, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={12} fill={color} />
      <Path d="M7 7l10 10M17 7L7 17" stroke="#ffffff" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export const SOCIAL_ICONS = [
  { Icon: FacebookIcon, label: "Facebook" },
  { Icon: InstagramIcon, label: "Instagram" },
  { Icon: YoutubeIcon, label: "YouTube" },
  { Icon: XIcon, label: "X" },
] as const;
