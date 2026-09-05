import { prisma } from "@/lib/prisma";
import { Mail, Phone, MapPin } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | VIDLIX",
  description: "Get in touch with VIDLIX for brand collaborations, creator applications, or general inquiries.",
};

export default async function ContactPage() {
  const company = await prisma.companySettings.findUnique({ where: { id: "company" } });
  const phone = company?.phone || "+91 74887 16130";
  const email = company?.email || "hello@vidlix.in";
  const address = company?.address || "Delhi, India";

  return (
    <div className="text-white max-w-2xl mx-auto px-6 py-20">
      <div className="text-[11px] font-medium tracking-[0.3em] text-violet-400">GET IN TOUCH</div>
      <h1 className="text-3xl sm:text-5xl font-bold mt-4 mb-6 text-balance">Contact</h1>
      <p className="text-neutral-300 leading-relaxed mb-10">
        For brand collaborations or creator applications, please use the
        dedicated inquiry forms — our team reviews every submission
        personally.
      </p>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-5">
        <a href={`tel:${phone.replace(/\s+/g, "")}`} className="flex items-center gap-3.5 text-neutral-300 transition-colors hover:text-white">
          <span className="flex items-center justify-center size-10 rounded-full bg-violet-500/10 border border-violet-400/20 shrink-0">
            <Phone className="size-4.5 text-violet-400" />
          </span>
          {phone}
        </a>
        <a href={`mailto:${email}`} className="flex items-center gap-3.5 text-neutral-300 transition-colors hover:text-white">
          <span className="flex items-center justify-center size-10 rounded-full bg-violet-500/10 border border-violet-400/20 shrink-0">
            <Mail className="size-4.5 text-violet-400" />
          </span>
          {email}
        </a>
        <div className="flex items-center gap-3.5 text-neutral-300">
          <span className="flex items-center justify-center size-10 rounded-full bg-violet-500/10 border border-violet-400/20 shrink-0">
            <MapPin className="size-4.5 text-violet-400" />
          </span>
          {address}
        </div>
      </div>
    </div>
  );
}
