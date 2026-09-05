// Recreated VIDLIX wordmark — bold text with a violet-accented X, matching
// the brand logo shown to us. Swap this for an <img> of the real logo file
// once it's dropped into assets/logo/ — every caller passes only sizing/
// color classes, so the swap is a one-file change.
export function VidlixWordmark({
  className = "",
  xClassName = "text-violet-500",
}: {
  className?: string;
  xClassName?: string;
}) {
  return (
    <span className={className}>
      VIDLI<span className={xClassName}>X</span>
    </span>
  );
}
