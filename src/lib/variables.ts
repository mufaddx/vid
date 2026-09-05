import type { Agreement, Brand, Campaign, CompanySettings, Creator } from "@prisma/client";
import { formatDate, formatINR } from "@/lib/format";

/**
 * Smart variables (spec §54). Populated from live database records —
 * never free-typed by the admin — then substituted into agreement/email
 * content wherever `{{variable_name}}` appears.
 */
export function buildAgreementVariables(input: {
  creator: Creator;
  brand?: Brand | null;
  campaign?: Campaign | null;
  agreement: {
    agreementNumber: Agreement["agreementNumber"];
    startDate: Agreement["startDate"];
    endDate: Agreement["endDate"];
    commissionPercentage: number;
    createdAt: Agreement["createdAt"];
  };
  company: CompanySettings;
}): Record<string, string> {
  const { creator, brand, campaign, agreement, company } = input;

  const commissionPct = Number(agreement.commissionPercentage);
  const managementFee = creator.managementFee ? Number(creator.managementFee) : undefined;
  const campaignFee = campaign?.budget ? Number(campaign.budget) : undefined;
  const creatorPayout =
    campaignFee !== undefined ? campaignFee * (1 - commissionPct / 100) : undefined;

  const socialLine = (platform: string, username?: string) => (username ? `@${username}` : "—");

  return {
    creator_name: creator.name,
    creator_email: creator.email ?? "—",
    creator_phone: creator.phone ?? "—",
    creator_address: [creator.address, creator.city, creator.state, creator.country]
      .filter(Boolean)
      .join(", "),
    instagram: socialLine("instagram"),
    youtube: socialLine("youtube"),
    facebook: socialLine("facebook"),
    brand_name: brand?.name ?? "—",
    brand_email: brand?.email ?? "—",
    campaign_name: campaign?.name ?? "—",
    campaign_fee: campaignFee !== undefined ? formatINR(campaignFee) : "—",
    commission_percentage: `${commissionPct}%`,
    creator_payout: creatorPayout !== undefined ? formatINR(creatorPayout) : "—",
    management_fee: managementFee !== undefined ? formatINR(managementFee) : "—",
    agreement_number: agreement.agreementNumber,
    agreement_date: formatDate(agreement.createdAt),
    start_date: formatDate(agreement.startDate),
    end_date: formatDate(agreement.endDate),
    company_name: company.companyName,
    company_email: company.email,
    company_address: company.address,
  };
}

export function renderTemplate(content: string, variables: Record<string, string>): string {
  return content.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key: string) => {
    return Object.prototype.hasOwnProperty.call(variables, key) ? variables[key] : match;
  });
}

export const AVAILABLE_VARIABLES = [
  "creator_name",
  "creator_email",
  "creator_phone",
  "creator_address",
  "instagram",
  "youtube",
  "facebook",
  "brand_name",
  "brand_email",
  "campaign_name",
  "campaign_fee",
  "commission_percentage",
  "creator_payout",
  "management_fee",
  "agreement_number",
  "agreement_date",
  "start_date",
  "end_date",
  "company_name",
  "company_email",
  "company_address",
] as const;
