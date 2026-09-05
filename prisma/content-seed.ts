import { PrismaClient } from "@prisma/client";

// Real, permanent site content — footer links, legal pages, blog
// categories/articles. Shared by prisma/seed.ts (local prototype) and
// prisma/seed.prod.ts (production bootstrap) so this content is never
// duplicated or allowed to drift between the two.

const FOOTER_LINKS: { group: "COMPANY" | "PLATFORM" | "GET_STARTED"; label: string; href: string; order: number }[] = [
  // Company — 5
  { group: "COMPANY", label: "About Us", href: "/about", order: 1 },
  { group: "COMPANY", label: "Contact", href: "/contact", order: 2 },
  { group: "COMPANY", label: "Blog", href: "/blog", order: 3 },
  { group: "COMPANY", label: "FAQ", href: "/faq", order: 4 },
  { group: "COMPANY", label: "How It Works", href: "/how-it-works", order: 5 },
  // Platform — 5
  { group: "PLATFORM", label: "Creators", href: "/creators", order: 1 },
  { group: "PLATFORM", label: "For Brands", href: "/for-brands", order: 2 },
  { group: "PLATFORM", label: "For Creators", href: "/for-creators", order: 3 },
  { group: "PLATFORM", label: "How It Works", href: "/how-it-works", order: 4 },
  { group: "PLATFORM", label: "Blog", href: "/blog", order: 5 },
  // Get Started — 5
  { group: "GET_STARTED", label: "Brand Inquiry", href: "/brand-inquiry", order: 1 },
  { group: "GET_STARTED", label: "Creator Inquiry", href: "/creator-inquiry", order: 2 },
  { group: "GET_STARTED", label: "Find a Creator", href: "/creators", order: 3 },
  { group: "GET_STARTED", label: "Contact Sales", href: "/contact", order: 4 },
  { group: "GET_STARTED", label: "FAQ", href: "/faq", order: 5 },
];

// ---------------------------------------------------------------------------
// Legal pages
// ---------------------------------------------------------------------------

const EFFECTIVE_DATE = "5 September 2026";
const LEGAL_CONTACT = `
  <p>Questions about this policy can be sent to <a href="mailto:hello@vidlix.in">hello@vidlix.in</a> or via our <a href="/contact">Contact page</a>.</p>
`;
const LEGAL_ADVICE_NOTICE = `
  <p><em>This policy is provided for general information about how VIDLIX operates. It is not a substitute for professional legal advice. If you need legal guidance specific to your situation, please consult a qualified lawyer.</em></p>
`;

const LEGAL_PAGES: { slug: string; title: string; content: string }[] = [
  {
    slug: "terms",
    title: "Terms & Conditions",
    content: `
      <p><strong>Effective date:</strong> ${EFFECTIVE_DATE}</p>
      <h2>1. Introduction</h2>
      <p>These Terms &amp; Conditions ("Terms") govern your access to and use of the VIDLIX website and the creator management, brand collaboration, agreement and payment services VIDLIX provides (together, the "Service"). By using the Service, you agree to these Terms.</p>
      <h2>2. What VIDLIX Is</h2>
      <p>VIDLIX is a creator and influencer management company. We represent creators, connect them with brands, and administer collaborations — including negotiation, e-signed agreements, invoicing and payouts — on behalf of the parties we work with. VIDLIX is not a self-service marketplace: every collaboration is handled directly by our team.</p>
      <h2>3. Using the Website</h2>
      <p>The public website lets visitors browse VIDLIX-managed creators and submit inquiries as a prospective brand or creator. Submitting an inquiry does not create a binding relationship — it begins a conversation with our team, who will follow up to discuss next steps.</p>
      <h2>4. Accounts and Agreements</h2>
      <p>Creators and brands do not self-manage accounts on this website. Formal relationships with VIDLIX (management agreements, brand collaboration agreements) are established through documents prepared by our team and e-signed by every party, with an audit trail of who signed what and when.</p>
      <h2>5. Payments</h2>
      <p>Where a collaboration involves payment — brand campaign fees, management fees, or creator payouts — the applicable amounts, timelines and commission are set out in the relevant signed agreement and invoice, not on this website.</p>
      <h2>6. Intellectual Property</h2>
      <p>The VIDLIX name, logo and website content are the property of VIDLIX (Vidlix Media Private Limited) unless otherwise stated. See our <a href="/legal/intellectual-property">Intellectual Property &amp; Copyright Policy</a> for details on content ownership in collaborations.</p>
      <h2>7. Termination</h2>
      <p>We may suspend or end access to the website for anyone who misuses it, submits fraudulent inquiries, or violates these Terms. Termination of a signed management or collaboration agreement is governed by the terms of that specific agreement.</p>
      <h2>8. Limitation of Liability</h2>
      <p>The website and its content are provided "as is." VIDLIX is not liable for indirect or consequential losses arising from use of the website, to the maximum extent permitted by law. This does not limit liability that cannot be excluded under applicable law.</p>
      <h2>9. Changes to These Terms</h2>
      <p>We may update these Terms from time to time. The effective date above reflects the latest revision. Continued use of the website after a change means you accept the updated Terms.</p>
      <h2>10. Contact</h2>
      ${LEGAL_CONTACT}
      ${LEGAL_ADVICE_NOTICE}
    `,
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    content: `
      <p><strong>Effective date:</strong> ${EFFECTIVE_DATE}</p>
      <h2>1. What This Covers</h2>
      <p>This Privacy Policy explains what information VIDLIX collects through this website and how it is used, when you browse the site, submit a brand or creator inquiry, or communicate with our team.</p>
      <h2>2. Information We Collect</h2>
      <ul>
        <li><strong>Inquiry information:</strong> name, email, phone number, company/brand name, and the details you provide in a brand or creator inquiry form.</li>
        <li><strong>Agreement and account information:</strong> for creators and brands VIDLIX formally works with, information needed to prepare agreements, invoices and payouts (e.g. address, bank/UPI details, GST information where applicable).</li>
        <li><strong>Technical information:</strong> standard web server logs (such as IP address and browser type) generated by normal website operation.</li>
      </ul>
      <h2>3. How We Use Information</h2>
      <p>We use this information to respond to inquiries, evaluate prospective collaborations, prepare and administer agreements, process invoices and payouts, and operate and improve the website.</p>
      <h2>4. Sharing of Information</h2>
      <p>We do not sell personal information. Information is shared only as needed to run a collaboration you are part of (for example, sharing a creator's relevant details with a brand they are collaborating with under a signed agreement), or with service providers who help us operate the Service (such as email delivery and hosting providers), under appropriate confidentiality expectations.</p>
      <h2>5. Data Retention</h2>
      <p>We retain inquiry and agreement-related information for as long as needed to provide the Service and to meet legal, accounting and record-keeping obligations (for example, signed agreements and financial records).</p>
      <h2>6. Your Choices</h2>
      <p>You can ask us to review, correct, or delete personal information you have submitted, subject to our legal and contractual record-keeping obligations, by contacting us using the details below.</p>
      <h2>7. Security</h2>
      <p>We take reasonable technical and organizational measures to protect information submitted to us. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.</p>
      <h2>8. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. The effective date above reflects the latest revision.</p>
      <h2>9. Contact</h2>
      ${LEGAL_CONTACT}
      ${LEGAL_ADVICE_NOTICE}
    `,
  },
  {
    slug: "cookie-policy",
    title: "Cookie Policy",
    content: `
      <p><strong>Effective date:</strong> ${EFFECTIVE_DATE}</p>
      <h2>1. What Are Cookies</h2>
      <p>Cookies are small text files stored on your device when you visit a website. They help a site function correctly and, where used, remember preferences between visits.</p>
      <h2>2. Cookies We Use</h2>
      <p>The VIDLIX website currently uses only strictly necessary cookies required for core functionality, such as keeping an administrator securely signed in to the admin panel. We do not currently use advertising or third-party tracking cookies on the public website.</p>
      <h2>3. Managing Cookies</h2>
      <p>Most browsers let you view, delete and block cookies through their settings. Blocking strictly necessary cookies may prevent parts of the website (such as the admin panel) from working correctly.</p>
      <h2>4. Changes to This Policy</h2>
      <p>If VIDLIX begins using additional categories of cookies in the future (for example, analytics), this policy will be updated accordingly before those cookies are used.</p>
      <h2>5. Contact</h2>
      ${LEGAL_CONTACT}
      ${LEGAL_ADVICE_NOTICE}
    `,
  },
  {
    slug: "refund-cancellation",
    title: "Refund & Cancellation Policy",
    content: `
      <p><strong>Effective date:</strong> ${EFFECTIVE_DATE}</p>
      <h2>1. Scope</h2>
      <p>This policy covers payments made in connection with VIDLIX management services and brand campaigns, as reflected in individual invoices and signed agreements. It does not describe a fixed public price list, since fees are agreed per creator and per campaign.</p>
      <h2>2. Campaign Payments</h2>
      <p>Refunds or adjustments to a brand campaign payment are handled according to the payment and delivery terms set out in that campaign's signed Brand Collaboration Agreement. Where a deliverable is not completed as agreed, VIDLIX will work with both parties toward a fair resolution, which may include a partial refund or adjustment to a future invoice, as agreed in writing.</p>
      <h2>3. Management Fees</h2>
      <p>Where a Creator Management Agreement includes a monthly management fee, cancellation of that fee going forward is handled through a written Cancellation Agreement, as described in the applicable Creator Management Agreement. Fees already invoiced and payable for services already rendered are not refunded, except where required by law or agreed in writing.</p>
      <h2>4. How to Request a Review</h2>
      <p>To raise a payment dispute or request a refund review, contact us with your invoice or agreement number using the details below. We review each request individually against the terms of the relevant signed agreement.</p>
      <h2>5. Contact</h2>
      ${LEGAL_CONTACT}
      ${LEGAL_ADVICE_NOTICE}
    `,
  },
  {
    slug: "community-guidelines",
    title: "Community Guidelines",
    content: `
      <p><strong>Effective date:</strong> ${EFFECTIVE_DATE}</p>
      <h2>1. Purpose</h2>
      <p>These guidelines describe the standard of conduct VIDLIX expects from everyone we work with or who interacts with our website — creators, brands, and visitors submitting inquiries.</p>
      <h2>2. Expected Conduct</h2>
      <ul>
        <li>Provide accurate information in inquiries, agreements and audience data.</li>
        <li>Communicate professionally and in good faith with VIDLIX and collaboration partners.</li>
        <li>Honour the commitments made in signed agreements — deliverables, timelines and payments.</li>
        <li>Respect the intellectual property and confidential information of others.</li>
      </ul>
      <h2>3. Not Acceptable</h2>
      <ul>
        <li>Submitting fraudulent inquiries or falsified audience/engagement data.</li>
        <li>Harassment, discrimination, or abusive communication toward VIDLIX staff or collaboration partners.</li>
        <li>Circumventing a VIDLIX-managed agreement to deal directly in a way that breaches its terms.</li>
      </ul>
      <h2>4. Enforcement</h2>
      <p>Violations of these guidelines may result in VIDLIX declining or ending a working relationship, in addition to any rights available under a signed agreement.</p>
      <h2>5. Contact</h2>
      ${LEGAL_CONTACT}
      ${LEGAL_ADVICE_NOTICE}
    `,
  },
  {
    slug: "acceptable-use",
    title: "Acceptable Use Policy",
    content: `
      <p><strong>Effective date:</strong> ${EFFECTIVE_DATE}</p>
      <h2>1. Purpose</h2>
      <p>This Acceptable Use Policy sets out how the VIDLIX website and its forms may and may not be used.</p>
      <h2>2. Permitted Use</h2>
      <p>You may browse the website and submit brand or creator inquiries for genuine business purposes related to VIDLIX's services.</p>
      <h2>3. Prohibited Use</h2>
      <ul>
        <li>Attempting to access the admin panel or any other party's data without authorization.</li>
        <li>Uploading or submitting malicious code, or attempting to disrupt, overload, or probe the website's infrastructure.</li>
        <li>Scraping or harvesting website content or creator data at scale without permission.</li>
        <li>Submitting spam, or using the inquiry forms for purposes unrelated to VIDLIX's services.</li>
        <li>Impersonating another person, brand, or organization when submitting an inquiry.</li>
      </ul>
      <h2>4. Enforcement</h2>
      <p>We may block access, remove submitted content, or take other reasonable steps in response to a breach of this policy.</p>
      <h2>5. Contact</h2>
      ${LEGAL_CONTACT}
      ${LEGAL_ADVICE_NOTICE}
    `,
  },
  {
    slug: "creator-terms",
    title: "Creator Terms",
    content: `
      <p><strong>Effective date:</strong> ${EFFECTIVE_DATE}</p>
      <h2>1. Who This Applies To</h2>
      <p>These Creator Terms describe the general basis on which VIDLIX manages creators, in addition to — and read together with — each creator's individual, signed Creator Management Agreement, which controls in the event of any conflict.</p>
      <h2>2. Our Role</h2>
      <p>Once a Creator Management Agreement is signed, VIDLIX acts as the creator's management representative for securing, negotiating and administering brand collaborations, including contracting, invoicing and payout on the creator's behalf, as set out in that agreement.</p>
      <h2>3. Creator Responsibilities</h2>
      <ul>
        <li>Provide accurate profile, contact and social account information.</li>
        <li>Deliver contracted content in line with agreed Brand Collaboration Agreements.</li>
        <li>Disclose material conflicts of interest, including competing management arrangements, as required by the signed agreement.</li>
      </ul>
      <h2>4. Commission and Payouts</h2>
      <p>Commission rates, monthly management fees (if any), and per-platform terms are set out in the creator's Creator Management Agreement and are visible to the creator on that signed document. Payouts are processed and tracked as described in that agreement.</p>
      <h2>5. Content Ownership</h2>
      <p>Content created by a creator remains that creator's intellectual property, subject to usage rights granted to brands under individual Brand Collaboration Agreements, as detailed in our <a href="/legal/intellectual-property">Intellectual Property &amp; Copyright Policy</a>.</p>
      <h2>6. Ending the Relationship</h2>
      <p>A Creator Management Agreement remains in effect until ended in writing through a Cancellation Agreement, as described in the signed agreement itself.</p>
      <h2>7. Contact</h2>
      ${LEGAL_CONTACT}
      ${LEGAL_ADVICE_NOTICE}
    `,
  },
  {
    slug: "brand-terms",
    title: "Brand Terms",
    content: `
      <p><strong>Effective date:</strong> ${EFFECTIVE_DATE}</p>
      <h2>1. Who This Applies To</h2>
      <p>These Brand Terms describe the general basis on which VIDLIX works with brands, in addition to — and read together with — each campaign's individual, signed Brand Collaboration Agreement, which controls in the event of any conflict.</p>
      <h2>2. Our Role</h2>
      <p>VIDLIX acts as the single point of contact between a brand and its VIDLIX-managed creator(s) for a given campaign — covering deliverables, paid-media usage rights, pricing, and e-signed agreement between the brand, VIDLIX, and the creator.</p>
      <h2>3. Brand Responsibilities</h2>
      <ul>
        <li>Provide accurate campaign briefs, timelines and budget information.</li>
        <li>Provide brand assets and approvals required for deliverables in a timely manner.</li>
        <li>Make payments in line with the invoice and payment terms of the signed agreement.</li>
      </ul>
      <h2>4. Deliverables and Usage Rights</h2>
      <p>Deliverables, quantities, rates, and any paid-advertising usage of creator content are set out in the campaign's Brand Collaboration Agreement. Usage beyond what is agreed requires a further agreement.</p>
      <h2>5. Payments</h2>
      <p>Campaign fees, taxes and payment schedules are set out in the invoice issued for the campaign, consistent with the signed agreement.</p>
      <h2>6. Audience Data</h2>
      <p>VIDLIX provides audience data for its managed creators as synced from their connected accounts. See our <a href="/legal/disclaimer">Disclaimer</a> regarding third-party platform data.</p>
      <h2>7. Contact</h2>
      ${LEGAL_CONTACT}
      ${LEGAL_ADVICE_NOTICE}
    `,
  },
  {
    slug: "intellectual-property",
    title: "Intellectual Property & Copyright Policy",
    content: `
      <p><strong>Effective date:</strong> ${EFFECTIVE_DATE}</p>
      <h2>1. VIDLIX Trademarks and Website Content</h2>
      <p>The VIDLIX name, wordmark, and the design, text and graphics of this website (excluding creator profile content and images supplied by creators) are the property of Vidlix Media Private Limited, unless otherwise credited.</p>
      <h2>2. Creator Content</h2>
      <p>Content created by a VIDLIX-managed creator remains that creator's intellectual property. Any usage rights granted to a brand — including paid-advertising usage — are limited to what is specifically set out in that campaign's signed Brand Collaboration Agreement (scope, platform, and duration).</p>
      <h2>3. Brand Assets</h2>
      <p>Logos, product images and other assets a brand supplies for a campaign remain the brand's property and are used by VIDLIX and the creator solely to deliver the agreed campaign.</p>
      <h2>4. Reporting Infringement</h2>
      <p>If you believe content on this website infringes your intellectual property rights, contact us with details of the content and your rights, and we will review the matter.</p>
      <h2>5. Contact</h2>
      ${LEGAL_CONTACT}
      ${LEGAL_ADVICE_NOTICE}
    `,
  },
  {
    slug: "disclaimer",
    title: "Disclaimer",
    content: `
      <p><strong>Effective date:</strong> ${EFFECTIVE_DATE}</p>
      <h2>1. General Information</h2>
      <p>The content on this website, including the blog, is provided for general informational purposes about VIDLIX and the creator economy. It is not professional, legal, financial, or tax advice, and should not be relied on as such.</p>
      <h2>2. Audience and Performance Data</h2>
      <p>Audience figures shown for VIDLIX-managed creators are synced from the creators' connected social accounts at the time of syncing. Third-party platform data can change and VIDLIX does not control the underlying platforms' reporting accuracy.</p>
      <h2>3. Campaign Outcomes</h2>
      <p>VIDLIX does not guarantee specific campaign results (such as sales, engagement, or reach) beyond what is expressly agreed in a signed Brand Collaboration Agreement.</p>
      <h2>4. External Links</h2>
      <p>This website may reference or link to third-party platforms (such as creators' social media accounts). VIDLIX is not responsible for the content or practices of third-party sites.</p>
      <h2>5. Contact</h2>
      ${LEGAL_CONTACT}
      ${LEGAL_ADVICE_NOTICE}
    `,
  },
];

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

const BLOG_CATEGORIES = [
  { name: "Creator Economy", slug: "creator-economy" },
  { name: "Brand Collaborations", slug: "brand-collaborations" },
  { name: "Growth & Strategy", slug: "growth-strategy" },
  { name: "Platform Updates", slug: "platform-updates" },
];

type SeedPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  readingMinutes: number;
  featured?: boolean;
  content: string;
};

const BLOG_POSTS: SeedPost[] = [
  {
    slug: "state-of-the-creator-economy",
    title: "The State of the Creator Economy: Why Management Matters More Than Ever",
    excerpt:
      "As the creator economy matures, the gap between creators who treat it as a hobby and those who run it as a business is widening. Here's where professional management fits in.",
    category: "creator-economy",
    tags: ["creator economy", "management"],
    readingMinutes: 6,
    featured: true,
    content: `
      <p>A few years ago, "creator economy" was still a buzzword. Today it's a genuine industry — with brand budgets, agencies, legal frameworks and, increasingly, professional management, all built around people who make content for a living.</p>
      <h2>From side hustle to business</h2>
      <p>The creators who grow past a certain point almost always hit the same wall: the skills that make someone great at making content — consistency, creative instinct, community connection — are not the same skills needed to negotiate a brand deal, price a deliverable correctly, chase an unpaid invoice, or read the fine print in a usage-rights clause.</p>
      <p>That mismatch is exactly why creator management exists. It's not about replacing the creator's voice or creative control — it's about taking the business side off their plate entirely, so the thing that made them successful in the first place (the content) stays the focus.</p>
      <h2>What "managed" actually means</h2>
      <p>At VIDLIX, being a managed creator means every brand conversation, every contract, every invoice and every payout runs through one professional process — not a spreadsheet, not a DM negotiation, not a "let's figure it out later" handshake deal.</p>
      <ul>
        <li>Brand inquiries are qualified and negotiated on the creator's behalf.</li>
        <li>Every collaboration is backed by a signed, e-signed agreement — creator, brand and VIDLIX, all accountable.</li>
        <li>Payments are invoiced, tracked and paid out transparently, with a clear commission structure agreed up front.</li>
      </ul>
      <h2>Why this matters for brands too</h2>
      <p>It's not just creators who benefit. Brands working with managed creators get a single point of contact, verified audience data instead of self-reported numbers, and a paper trail for every deliverable and payment — the same professionalism they'd expect from any other marketing partner.</p>
      <p>The creator economy isn't slowing down. The creators — and the brands — who treat it like the real business it has become are the ones who will keep winning as it matures.</p>
    `,
  },
  {
    slug: "how-brands-can-find-the-right-creators",
    title: "How Brands Can Find the Right Creators (Not Just the Biggest Ones)",
    excerpt:
      "Follower count is the easiest number to look at and the least useful one for predicting campaign results. Here's what to actually look for.",
    category: "brand-collaborations",
    tags: ["brand strategy", "creator matching"],
    readingMinutes: 5,
    content: `
      <p>When brands start looking for creators to work with, the instinct is almost always to sort by follower count. It's understandable — it's the one number every platform shows front and centre. It's also frequently the wrong number to optimize for.</p>
      <h2>Audience fit beats audience size</h2>
      <p>A creator with a smaller, tightly-engaged audience in your exact category will usually outperform a much bigger, broader account for a niche product. Category, city/region, and the tone of a creator's content matter more than raw scale for most campaigns.</p>
      <h2>Verified data, not self-reported numbers</h2>
      <p>Inflated or outdated follower counts are one of the most common sources of wasted campaign budget. Working with a managed creator network means the audience data brands see has actually been synced from the platform, not typed in by the creator.</p>
      <h2>Process matters as much as the creator</h2>
      <p>Even the perfect creator match can turn into a headache without a clear process — briefing, deliverables, timelines, usage rights, and payment terms all need to be nailed down before content goes live, not after.</p>
      <p>That's the real value a management layer like VIDLIX adds for brands: not just a shortlist of creators, but a single point of contact who runs the whole collaboration — from first brief to final invoice — professionally.</p>
    `,
  },
  {
    slug: "anatomy-of-a-brand-collaboration-agreement",
    title: "The Anatomy of a Good Brand Collaboration Agreement",
    excerpt:
      "A strong agreement protects everyone — the brand, the creator, and the relationship. Here's what actually needs to be in it.",
    category: "brand-collaborations",
    tags: ["contracts", "e-signing"],
    readingMinutes: 5,
    content: `
      <p>Most creator-brand disagreements don't come from bad intentions — they come from things that were never written down clearly in the first place. A solid Brand Collaboration Agreement removes that ambiguity before it becomes a problem.</p>
      <h2>Deliverables, not vibes</h2>
      <p>"A few posts" is not a deliverable. A real agreement specifies exact deliverable types (an Instagram Reel, a YouTube video, a Facebook post), quantities, and the rate for each — so there's no confusion about what "done" looks like.</p>
      <h2>Paid usage rights, spelled out</h2>
      <p>If a brand wants to run a creator's content as paid advertising — on Meta, Google, or YouTube — that's a separate right from the organic post itself, and it should carry its own authorization status and fee, with a clear start and end date.</p>
      <h2>Pricing that adds up automatically</h2>
      <p>A good agreement doesn't leave the total open to interpretation. Every line item — deliverables, advertising usage, any extra costs — should roll up into a single, auditable subtotal, tax, and grand total that both sides can verify.</p>
      <h2>Three-way accountability</h2>
      <p>A brand collaboration involves three parties — the brand, the creator, and the management company running it. All three should sign, and the agreement should only be considered complete once every signature is in.</p>
      <p>None of this needs to be complicated for the people involved — it just needs to be handled properly, once, by whoever is running the collaboration. That's the entire point of a management layer like VIDLIX sitting between brand and creator.</p>
    `,
  },
  {
    slug: "creator-growth-beyond-vanity-metrics",
    title: "Creator Growth Beyond Vanity Metrics",
    excerpt:
      "Follower count is a headline number. It's rarely the number that actually predicts whether a creator is ready for serious brand partnerships.",
    category: "growth-strategy",
    tags: ["growth", "audience"],
    readingMinutes: 4,
    content: `
      <p>It's tempting to treat follower count as the scoreboard of a creator career. In practice, it's one of the least reliable signals of whether a creator is ready to work with brands at a serious level.</p>
      <h2>What actually matters</h2>
      <ul>
        <li><strong>Engagement quality</strong> — comments and shares that show real attention, not just passive scrolling past a post.</li>
        <li><strong>Audience composition</strong> — does the audience actually match the category and geography a brand cares about?</li>
        <li><strong>Consistency</strong> — a steady publishing cadence over time is a stronger signal than one viral spike.</li>
        <li><strong>Cross-platform presence</strong> — a creator active on Instagram, YouTube and Facebook gives a brand more ways to reach the same audience.</li>
      </ul>
      <h2>Why this matters for management</h2>
      <p>When VIDLIX evaluates and represents a creator, the goal isn't to chase the biggest number — it's to build an accurate, verified picture of who a creator actually reaches, so brand conversations are grounded in reality rather than a single headline stat.</p>
      <p>That's also why real, synced audience data — not self-reported numbers — is worth insisting on, whether you're a creator building your case to brands, or a brand evaluating who to work with.</p>
    `,
  },
  {
    slug: "why-vidlix-manages-not-lists",
    title: "Why VIDLIX Manages Creators Instead of Just Listing Them",
    excerpt:
      "There's a real difference between a marketplace that connects people and a management company that runs the relationship. Here's why we chose the second model.",
    category: "platform-updates",
    tags: ["about vidlix", "management model"],
    readingMinutes: 4,
    content: `
      <p>There are two very different ways to build a creator-brand platform. One is a marketplace: list creators, let brands browse, and step back once an introduction is made. The other is management: represent creators directly and run every collaboration end-to-end. VIDLIX is built the second way, deliberately.</p>
      <h2>The marketplace gap</h2>
      <p>Marketplaces are great at discovery and terrible at everything after the introduction. Once two parties are connected, the marketplace usually has no real involvement in negotiation, contracting, delivery, or payment — which is exactly where most collaborations run into trouble.</p>
      <h2>What management actually adds</h2>
      <p>As a management company, VIDLIX represents its creators directly — meaning we negotiate on their behalf, prepare and e-sign every agreement, issue invoices, track payments, and process payouts. Brands get one accountable point of contact for the entire campaign, not just an introduction.</p>
      <h2>The trade-off, honestly</h2>
      <p>This model means VIDLIX works with a curated roster of creators rather than an open marketplace anyone can join. That's intentional — it's what makes it possible to stand behind the audience data, the contracts, and the process for every single collaboration we run.</p>
      <p>If you're a brand tired of chasing creators for a status update, or a creator tired of chasing a brand for an invoice, this is the problem VIDLIX exists to solve.</p>
    `,
  },
  {
    slug: "video-content-that-actually-converts",
    title: "Video Content That Actually Converts: What Brands Get Wrong",
    excerpt:
      "The most common mistake in creator campaigns isn't the creator or the platform — it's briefing content like a TV ad instead of native content.",
    category: "growth-strategy",
    tags: ["content strategy", "video"],
    readingMinutes: 5,
    content: `
      <p>The fastest way to underperform on a creator campaign is to brief it like a television commercial and expect it to work like a creator post. The two are not the same format, and audiences can tell instantly.</p>
      <h2>Native beats polished</h2>
      <p>Content that looks and sounds like the creator's normal style consistently outperforms an over-scripted, brand-controlled version of the same message. Audiences follow a creator for their voice — a script that erases that voice erases the reason the audience is watching.</p>
      <h2>Give the brief, not the script</h2>
      <p>The most effective briefs describe the outcome (the key message, the call to action, any mandatory disclosures) and trust the creator to deliver it in their own format. The most restrictive briefs — full scripts, exact shot lists — usually produce the flattest results.</p>
      <h2>Plan for paid amplification from the start</h2>
      <p>If there's any chance a piece of content will later be boosted as paid advertising, that usage right needs to be part of the original agreement — not negotiated after the fact once the content already exists and performed well organically.</p>
      <p>Getting this right isn't about creative talent alone — it's about a briefing and agreement process that sets creators up to make content that actually sounds like them, with the commercial terms already sorted out before day one.</p>
    `,
  },
];

export async function seedSiteContent(prisma: PrismaClient) {
  for (const link of FOOTER_LINKS) {
    const existing = await prisma.footerLink.findFirst({ where: { group: link.group, label: link.label } });
    if (!existing) {
      await prisma.footerLink.create({ data: link });
    }
  }

  for (const page of LEGAL_PAGES) {
    await prisma.legalPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }

  const categoryIdBySlug: Record<string, string> = {};
  for (const cat of BLOG_CATEGORIES) {
    const created = await prisma.blogCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryIdBySlug[cat.slug] = created.id;
  }

  for (const post of BLOG_POSTS) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
    if (!existing) {
      await prisma.blogPost.create({
        data: {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          categoryId: categoryIdBySlug[post.category],
          tags: post.tags,
          readingMinutes: post.readingMinutes,
          featured: post.featured ?? false,
          status: "PUBLISHED",
          authorName: "VIDLIX Team",
          publishedAt: new Date(),
          seoTitle: post.title,
          seoDescription: post.excerpt,
        },
      });
    }
  }
}
