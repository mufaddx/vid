// A seamless, continuously-scrolling horizontal ticker. The track is
// rendered twice back-to-back and animated exactly -50% on the X axis —
// since the two halves are identical, the loop point is invisible. Pure
// CSS transform animation (no JS, no layout thrash), and the wrapper
// clips the track so it can never widen the page itself.
export function Marquee({ items }: { items: string[] }) {
  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className="flex w-max animate-[marquee_28s_linear_infinite] motion-reduce:animate-none">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center shrink-0" aria-hidden={copy === 1}>
            {items.map((item, i) => (
              <span key={i} className="flex items-center shrink-0">
                <span className="px-5 text-xs sm:text-sm tracking-widest text-neutral-500 whitespace-nowrap">{item}</span>
                <span className="text-violet-500/40">•</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
