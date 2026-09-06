// Structured data for the two "real" agreement types (spec: Creator/Influencer
// Management Agreement vs Brand Collaboration Agreement). Stored in
// Agreement.details as JSON — kept separate from the legacy free-text
// `content` sections model used by older/custom agreements, so existing
// rows and code paths are untouched (see Agreement.details in schema.prisma).

import type { AgreementSection } from "@/lib/agreement-content";
export type { AgreementSection };

export type ChargeType =
  | "MONTHLY"
  | "PER_VIDEO"
  | "PER_REEL"
  | "PER_STORY"
  | "PER_CAMPAIGN"
  | "PER_PROJECT"
  | "ONE_TIME"
  | "CUSTOM";

export const CHARGE_TYPES: { value: ChargeType; label: string }[] = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "PER_VIDEO", label: "Per Video" },
  { value: "PER_REEL", label: "Per Reel" },
  { value: "PER_STORY", label: "Per Story" },
  { value: "PER_CAMPAIGN", label: "Per Campaign" },
  { value: "PER_PROJECT", label: "Per Project" },
  { value: "ONE_TIME", label: "One Time" },
  { value: "CUSTOM", label: "Custom" },
];

export type AdditionalService = {
  id: string;
  name: string; // e.g. "Video Editing", or free text when "Other"
  chargeType: ChargeType;
  amount: number;
  frequency: string; // human-readable, e.g. "Monthly", "Per Deliverable" — free text
  isFree: boolean;
};

export const SERVICE_PRESETS = [
  "Video Editing",
  "Photography",
  "Content Production",
  "Social Media Management",
  "Account Management",
  "Brand Outreach",
  "Campaign Management",
  "Paid Advertising Management",
  "Other",
];

/** Snapshotted at agreement creation time from the creator's connected
 * Social tab accounts — never hand-typed (spec: auto-populated, not
 * manually retyped), and preserved in the signed document even if the
 * creator's connections change later. */
export type CreatorSocialHandles = {
  instagram?: string;
  youtube?: string;
  facebook?: string;
};

export function hasSocialHandle(handles: CreatorSocialHandles | undefined | null): boolean {
  return !!(handles && (handles.instagram || handles.youtube || handles.facebook));
}

// Derives handles from a creator's live Social tab connections. Used both
// to populate a brand-new agreement's snapshot and, at render time, as a
// fallback for agreements saved before this field existed (whose stored
// `details.socialHandles` is empty) — so the document, live preview and
// signing summary never silently disagree on what's connected.
export function deriveSocialHandles(
  accounts: { platform: string; username: string }[],
): CreatorSocialHandles {
  const handles: CreatorSocialHandles = {};
  for (const account of accounts) {
    if (account.platform === "INSTAGRAM") handles.instagram = account.username;
    if (account.platform === "YOUTUBE") handles.youtube = account.username;
    if (account.platform === "FACEBOOK") handles.facebook = account.username;
  }
  return handles;
}

// Prefer whatever was actually saved on the agreement (frozen at
// signing time); only fall back to the creator's current connections
// when the stored snapshot has nothing at all (pre-existing drafts).
export function resolveSocialHandles(
  details: CreatorManagementDetails,
  liveAccounts: { platform: string; username: string }[],
): CreatorSocialHandles {
  return hasSocialHandle(details.socialHandles) ? details.socialHandles : deriveSocialHandles(liveAccounts);
}

/** Per-platform commission percentages — the Creator is managed per
 * connected platform, and VIDLIX's payout cut can differ by platform
 * (e.g. Instagram brand deals vs YouTube AdSense/sponsorships). Only
 * platforms the Creator actually has connected are shown/editable. */
export type CreatorPlatformCommissions = {
  instagram?: number;
  youtube?: number;
  facebook?: number;
};

export type CreatorManagementDetails = {
  kind: "CREATOR_MANAGEMENT";
  agreementDate: string; // ISO date — the single date this agreement was entered into.
  // Deliberately no end date: this agreement is open-ended/permanent once
  // signed. It stays in effect until terminated in writing via a separate
  // Cancellation Agreement, not by running past a fixed term.
  monthlyFee: { isFree: boolean; amount: number };
  additionalServices: AdditionalService[];
  socialHandles: CreatorSocialHandles;
  platformCommissions: CreatorPlatformCommissions;
  terms: string; // short management terms paragraph
  // Unlimited, fully custom heading+body sections beyond the built-in
  // "Management Terms" above (e.g. Payment Terms, Content Usage Rights,
  // Termination Conditions, Confidentiality) — rendered after Management
  // Terms in both the live preview and the PDF, and free to overflow onto
  // additional pages (the letterhead repeats on every page automatically).
  customSections: AgreementSection[];
};

export function emptyCreatorManagementDetails(): CreatorManagementDetails {
  return {
    kind: "CREATOR_MANAGEMENT",
    agreementDate: new Date().toISOString().slice(0, 10),
    monthlyFee: { isFree: false, amount: 0 },
    additionalServices: [],
    socialHandles: {},
    platformCommissions: {},
    terms:
      "The Creator appoints VIDLIX as their exclusive management representative to secure, negotiate and administer brand collaborations across the Creator's social media presence, effective the Agreement Date above.\n\n" +
      "VIDLIX agrees to act in good faith and provide transparent accounting of revenue and commission for each platform managed. Content created by the Creator remains the Creator's intellectual property.\n\n" +
      "This Agreement remains in effect until terminated in writing by either party through a separate Cancellation Agreement, and is governed by the laws of India.",
    customSections: [],
  };
}

// ---------------------------------------------------------------------------

export type DeliverableType =
  | "INSTAGRAM_REEL"
  | "INSTAGRAM_STORY"
  | "INSTAGRAM_POST"
  | "YOUTUBE_VIDEO"
  | "YOUTUBE_SHORT"
  | "FACEBOOK_POST"
  | "FACEBOOK_REEL"
  | "OTHER";

export const DELIVERABLE_TYPES: { value: DeliverableType; label: string }[] = [
  { value: "INSTAGRAM_REEL", label: "Instagram Reel" },
  { value: "INSTAGRAM_STORY", label: "Instagram Story" },
  { value: "INSTAGRAM_POST", label: "Instagram Post" },
  { value: "YOUTUBE_VIDEO", label: "YouTube Video" },
  { value: "YOUTUBE_SHORT", label: "YouTube Short" },
  { value: "FACEBOOK_POST", label: "Facebook Post" },
  { value: "FACEBOOK_REEL", label: "Facebook Reel" },
  { value: "OTHER", label: "Other Custom Deliverable" },
];

export type Deliverable = {
  id: string;
  type: DeliverableType;
  label?: string; // used when type === OTHER
  quantity: number;
  rate: number;
};

export type AdPlatform = "META" | "GOOGLE" | "YOUTUBE" | "OTHER";

export const AD_PLATFORMS: { value: AdPlatform; label: string }[] = [
  { value: "META", label: "Meta / Instagram / Facebook Advertising" },
  { value: "GOOGLE", label: "Google Advertising" },
  { value: "YOUTUBE", label: "YouTube Advertising" },
  { value: "OTHER", label: "Other Paid Media" },
];

export type AuthorizationStatus =
  | "NOT_REQUIRED"
  | "PENDING"
  | "REQUESTED"
  | "AUTHORIZED"
  | "REJECTED"
  | "EXPIRED"
  | "REVOKED";

export const AUTHORIZATION_STATUSES: { value: AuthorizationStatus; label: string }[] = [
  { value: "NOT_REQUIRED", label: "Not Required" },
  { value: "PENDING", label: "Pending" },
  { value: "REQUESTED", label: "Requested" },
  { value: "AUTHORIZED", label: "Authorized" },
  { value: "REJECTED", label: "Rejected" },
  { value: "EXPIRED", label: "Expired" },
  { value: "REVOKED", label: "Revoked" },
];

export type AdvertisingUsage = {
  id: string;
  platform: AdPlatform;
  label?: string; // used when platform === OTHER
  enabled: boolean;
  usageType: string;
  durationDays: number | null;
  startDate: string | null;
  endDate: string | null;
  fee: number;
  authorizationStatus: AuthorizationStatus;
  notes?: string;
};

export type PricingCategory =
  | "CONTENT"
  | "ADVERTISING"
  | "MANAGEMENT"
  | "EDITING"
  | "PRODUCTION"
  | "TRAVEL"
  | "USAGE_RIGHTS"
  | "OTHER";

export const PRICING_CATEGORIES: { value: PricingCategory; label: string }[] = [
  { value: "CONTENT", label: "Content" },
  { value: "ADVERTISING", label: "Advertising" },
  { value: "MANAGEMENT", label: "Management" },
  { value: "EDITING", label: "Editing" },
  { value: "PRODUCTION", label: "Production" },
  { value: "TRAVEL", label: "Travel" },
  { value: "USAGE_RIGHTS", label: "Usage Rights" },
  { value: "OTHER", label: "Other" },
];

/** A pricing line item is either auto-derived from a deliverable/ad-usage row, or a manual extra charge. */
export type PricingLineItem = {
  id: string;
  category: PricingCategory;
  description: string;
  quantity: number;
  rate: number;
  source?: "deliverable" | "advertising" | "manual";
};

export type BrandCollaborationDetails = {
  kind: "BRAND_COLLABORATION";
  brandContactName: string;
  brandContactEmail: string;
  brandContactPhone: string;
  creatorSocialSummary: string; // e.g. "Instagram @handle · YouTube handle"
  campaignName: string;
  campaignDescription: string;
  campaignStartDate: string;
  campaignEndDate: string;
  deliverables: Deliverable[];
  advertising: AdvertisingUsage[];
  extraPricingItems: PricingLineItem[]; // manual line items beyond deliverables/advertising
  taxPercentage: number;
  paymentTerms: string;
  // Unlimited, fully custom heading+body sections beyond the built-in
  // Payment Terms above (e.g. Content Usage Rights, Termination
  // Conditions, Confidentiality) — see CreatorManagementDetails.customSections.
  customSections: AgreementSection[];
};

export function emptyBrandCollaborationDetails(): BrandCollaborationDetails {
  const today = new Date().toISOString().slice(0, 10);
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return {
    kind: "BRAND_COLLABORATION",
    brandContactName: "",
    brandContactEmail: "",
    brandContactPhone: "",
    creatorSocialSummary: "",
    campaignName: "",
    campaignDescription: "",
    campaignStartDate: today,
    campaignEndDate: in30Days,
    deliverables: [],
    advertising: AD_PLATFORMS.map((p) => ({
      id: p.value,
      platform: p.value,
      enabled: false,
      usageType: "",
      durationDays: null,
      startDate: null,
      endDate: null,
      fee: 0,
      authorizationStatus: "NOT_REQUIRED",
    })),
    extraPricingItems: [],
    taxPercentage: 0,
    paymentTerms: "50% advance, balance on delivery. Payment due within 15 days of invoice.",
    customSections: [],
  };
}

export type AgreementDetails = CreatorManagementDetails | BrandCollaborationDetails;

export function parseDetails(json: unknown): AgreementDetails | null {
  if (!json || typeof json !== "object") return null;
  return json as AgreementDetails;
}

// --- Calculations (server is the source of truth — spec: never let the
// admin manually type a computed total) --------------------------------

export function deliverableLabel(d: Deliverable): string {
  if (d.type === "OTHER") return d.label?.trim() || "Other Deliverable";
  return DELIVERABLE_TYPES.find((t) => t.value === d.type)?.label ?? d.type;
}

export function deliverableAmount(d: Deliverable): number {
  return Math.max(0, d.quantity) * Math.max(0, d.rate);
}

export function adUsageLabel(a: AdvertisingUsage): string {
  if (a.platform === "OTHER") return a.label?.trim() || "Other Paid Media";
  return AD_PLATFORMS.find((p) => p.value === a.platform)?.label ?? a.platform;
}

/** Builds the full pricing table (deliverables + enabled ad usage + manual extras). */
export function buildPricingLineItems(details: BrandCollaborationDetails): PricingLineItem[] {
  const fromDeliverables: PricingLineItem[] = details.deliverables.map((d) => ({
    id: `deliverable-${d.id}`,
    category: "CONTENT",
    description: `${deliverableLabel(d)} — ${d.quantity} × ₹${d.rate.toLocaleString("en-IN")}`,
    quantity: d.quantity,
    rate: d.rate,
    source: "deliverable",
  }));

  const fromAds: PricingLineItem[] = details.advertising
    .filter((a) => a.enabled && a.fee > 0)
    .map((a) => ({
      id: `ad-${a.id}`,
      category: "ADVERTISING",
      description: `${adUsageLabel(a)}${a.durationDays ? ` — ${a.durationDays} Days` : ""}`,
      quantity: 1,
      rate: a.fee,
      source: "advertising",
    }));

  return [...fromDeliverables, ...fromAds, ...details.extraPricingItems];
}

export function computeBrandCollaborationTotals(details: BrandCollaborationDetails) {
  const lineItems = buildPricingLineItems(details);
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const tax = Math.round(subtotal * (details.taxPercentage / 100));
  const total = subtotal + tax;
  return { lineItems, subtotal, tax, total };
}

// --- Multi-page documents -------------------------------------------------
// These two structured agreement types used to be capped at one A4 page
// (an explicit character/row-count guard blocked saving beyond it). The
// cap has been removed: additional services, deliverables, pricing items
// and — most importantly — unlimited custom sections (see
// `customSections` above) are now free to flow onto Page 2, 3, etc.
// react-pdf already repeats the letterhead header/footer/watermark on
// every physical page automatically (they're `fixed` inside one
// `<Page>` in src/lib/pdf/Letterhead.tsx), so no new pagination code is
// needed — only the artificial one-page limit had to go.
