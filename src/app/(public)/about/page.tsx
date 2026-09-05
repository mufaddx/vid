import { ShieldCheck, Users2, Handshake } from "lucide-react";

const VALUES = [
  { icon: ShieldCheck, title: "Hands-on, not hands-off", body: "We negotiate, contract and pay on behalf of every creator we represent — never a self-service listing." },
  { icon: Users2, title: "One point of contact", body: "Brands and creators work with a single VIDLIX team throughout a collaboration, start to finish." },
  { icon: Handshake, title: "Transparent by default", body: "Every agreement, invoice and payout runs through one professional, auditable process." },
];

export default function AboutPage() {
  return (
    <div className="text-white">
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-4 text-center">
        <div className="text-[11px] font-medium tracking-[0.3em] text-violet-400">ABOUT VIDLIX</div>
        <h1 className="text-3xl sm:text-5xl font-bold mt-4 mb-8 text-balance">The people behind the influence.</h1>
        <p className="text-neutral-300 leading-relaxed text-base sm:text-lg mb-4">
          VIDLIX is a premium creator and influencer management company. We
          represent exceptional creators, connect them with ambitious brands,
          and run every collaboration — from first conversation to final
          payment — through one professional, transparent process.
        </p>
        <p className="text-neutral-400 leading-relaxed">
          We&rsquo;re not a marketplace, and we&rsquo;re not a self-service platform.
          VIDLIX is a hands-on management team working on behalf of every
          creator and brand we work with.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20 grid sm:grid-cols-3 gap-6">
        {VALUES.map((v) => (
          <div
            key={v.title}
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-violet-400/30 hover:bg-white/[0.04] hover:-translate-y-0.5"
          >
            <div className="size-11 rounded-xl bg-violet-500/10 border border-violet-400/20 flex items-center justify-center mb-5">
              <v.icon className="size-5 text-violet-400" />
            </div>
            <h3 className="font-semibold mb-2">{v.title}</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">{v.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
