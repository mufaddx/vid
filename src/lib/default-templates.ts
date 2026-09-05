import { stringifySections, type AgreementSection } from "@/lib/agreement-content";

// Default Creator Management Agreement template (spec §59). Commission is
// injected via {{commission_percentage}} — never hard-coded — so it stays
// configurable per agreement. This boilerplate language is a starting
// point only; production use requires review by qualified legal counsel
// (spec §165).

const creatorManagementSections: AgreementSection[] = [
  {
    id: "parties",
    heading: "1. Parties",
    body:
      "This Creator Management Agreement (\"Agreement\") is entered into on {{agreement_date}} between {{company_name}}, having its registered address at {{company_address}} (\"VIDLIX\"), and {{creator_name}}, residing at {{creator_address}} (\"Creator\").",
  },
  {
    id: "appointment",
    heading: "2. Appointment",
    body:
      "The Creator appoints VIDLIX as their exclusive management representative for the purpose of securing, negotiating and administering brand collaborations, sponsorships and related commercial opportunities across the Creator's social media presence, including {{instagram}}, {{youtube}} and {{facebook}}.",
  },
  {
    id: "scope",
    heading: "3. Scope of Management",
    body:
      "VIDLIX shall be responsible for identifying brand partnership opportunities, negotiating commercial terms on the Creator's behalf, preparing collaboration agreements, invoicing brands, collecting payments and disbursing the Creator's share as set out in this Agreement.",
  },
  {
    id: "commission",
    heading: "4. Management Commission",
    body:
      "In consideration of the services rendered, VIDLIX shall be entitled to a commission of {{commission_percentage}} of the gross value of each brand collaboration secured for the Creator during the term of this Agreement. The remaining balance shall be payable to the Creator as set out in Clause 5.",
  },
  {
    id: "payment-terms",
    heading: "5. Payment Terms",
    body:
      "VIDLIX shall remit the Creator's share of each campaign within a commercially reasonable period following receipt of cleared funds from the relevant brand. Where applicable, the Creator's monthly management fee is {{management_fee}}, payable in accordance with the recurring billing schedule communicated separately.",
  },
  {
    id: "responsibilities-creator",
    heading: "6. Creator Responsibilities",
    body:
      "The Creator agrees to deliver contracted content in a timely and professional manner, to disclose material conflicts of interest, and to refrain from entering into competing management arrangements for the categories covered by this Agreement during its term.",
  },
  {
    id: "responsibilities-vidlix",
    heading: "7. VIDLIX Responsibilities",
    body:
      "VIDLIX agrees to act in good faith in securing opportunities for the Creator, to provide transparent accounting of campaign revenue and commission, and to safeguard the Creator's confidential information and creative reputation.",
  },
  {
    id: "confidentiality",
    heading: "8. Confidentiality",
    body:
      "Both parties agree to keep confidential all commercial terms, brand communications and creator performance data shared in connection with this Agreement, except where disclosure is required by law or reasonably necessary to perform the services herein.",
  },
  {
    id: "ip",
    heading: "9. Intellectual Property",
    body:
      "All content created by the Creator remains the intellectual property of the Creator, subject to usage rights granted to brands under individual Brand Collaboration Agreements executed pursuant to this arrangement.",
  },
  {
    id: "termination",
    heading: "10. Termination",
    body:
      "Either party may terminate this Agreement by providing 30 days' written notice. Termination does not affect obligations already accrued, including commission owed on campaigns secured prior to the termination date.",
  },
  {
    id: "term",
    heading: "11. Agreement Period",
    body: "This Agreement is effective from {{start_date}} through {{end_date}}, unless terminated earlier in accordance with Clause 10.",
  },
  {
    id: "general",
    heading: "12. General Terms",
    body:
      "This Agreement constitutes the entire understanding between the parties with respect to its subject matter and may only be amended in writing signed by both parties. This Agreement shall be governed by the laws of India.\n\n---",
  },
  {
    id: "signatures",
    heading: "13. Signatures",
    body:
      "IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.",
  },
];

const brandCollaborationSections: AgreementSection[] = [
  {
    id: "parties",
    heading: "1. Parties",
    body:
      "This Brand Collaboration Agreement (\"Agreement\") is entered into on {{agreement_date}} between {{brand_name}} (\"Brand\") and {{creator_name}}, managed by {{company_name}} (\"VIDLIX\"), in connection with the campaign \"{{campaign_name}}\".",
  },
  {
    id: "deliverables",
    heading: "2. Deliverables",
    body:
      "The Creator shall deliver the content and deliverables agreed upon with the Brand for the campaign \"{{campaign_name}}\", within the timeline communicated separately by VIDLIX on the Creator's behalf.",
  },
  {
    id: "fee",
    heading: "3. Fee & Payment Terms",
    body:
      "The total campaign fee payable by the Brand is {{campaign_fee}}. Of this amount, VIDLIX's management commission is {{commission_percentage}}, and the Creator's net share is {{creator_payout}}. Payment shall be made by the Brand to VIDLIX, who shall disburse the Creator's share upon receipt of cleared funds.",
  },
  {
    id: "usage-rights",
    heading: "4. Usage Rights",
    body:
      "The Brand is granted a limited, non-exclusive license to repost and reference the delivered content for organic social media use, for a period to be agreed separately for any paid amplification or usage beyond organic posting.",
  },
  {
    id: "exclusivity",
    heading: "5. Exclusivity",
    body:
      "Unless otherwise agreed in writing, the Creator agrees not to promote directly competing brands within the same product category for 30 days following the publish date of the campaign content.",
  },
  {
    id: "approval",
    heading: "6. Content Approval & Revisions",
    body:
      "The Creator shall share draft content with the Brand (via VIDLIX) for approval prior to publishing. The Brand may request reasonable revisions consistent with the agreed brief.",
  },
  {
    id: "term",
    heading: "7. Term",
    body: "This Agreement is effective from {{start_date}} through {{end_date}}.\n\n---",
  },
  {
    id: "confidentiality",
    heading: "8. Confidentiality",
    body:
      "Both parties agree to keep confidential all commercial terms and creative materials exchanged in connection with this campaign.",
  },
  {
    id: "signatures",
    heading: "9. Signatures",
    body: "IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.",
  },
];

export const DEFAULT_TEMPLATES = [
  {
    name: "Creator Management Agreement",
    type: "CREATOR_MANAGEMENT" as const,
    description: "Standard exclusive management agreement between VIDLIX and a managed creator.",
    content: stringifySections(creatorManagementSections),
  },
  {
    name: "Brand Collaboration Agreement",
    type: "BRAND_COLLABORATION" as const,
    description: "Per-campaign agreement between a brand and a VIDLIX-managed creator.",
    content: stringifySections(brandCollaborationSections),
  },
];
