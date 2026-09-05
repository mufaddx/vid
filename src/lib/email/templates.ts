// Plain-HTML email templates (spec §129). Kept intentionally simple —
// table-based layout, inline styles — for maximum email-client compatibility.

function wrapper(bodyHtml: string): string {
  return `
  <div style="font-family: -apple-system, Segoe UI, Helvetica, Arial, sans-serif; background:#f5f3ff; padding:32px 0;">
    <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #ececec;">
      <div style="background:#111827; padding:24px 32px;">
        <span style="color:#ffffff; font-size:20px; font-weight:700; letter-spacing:0.08em;">VIDLIX</span>
        <div style="color:#a78bfa; font-size:11px; letter-spacing:0.15em; margin-top:2px;">CREATORS • BRANDS • BEYOND</div>
      </div>
      <div style="padding:32px; color:#111827; font-size:14px; line-height:1.6;">
        ${bodyHtml}
      </div>
      <div style="padding:20px 32px; background:#fafafa; color:#9ca3af; font-size:12px; border-top:1px solid #ececec;">
        VIDLIX &middot; hello@vidlix.in &middot; vidlix.in
      </div>
    </div>
  </div>`;
}

export function creatorInquiryConfirmationEmail(fullName: string): string {
  return wrapper(`
    <p>Hello ${fullName},</p>
    <p>Thank you. Your inquiry has been received by VIDLIX.</p>
    <p>Our team will review your information and contact you shortly.</p>
    <p>Regards,<br/>VIDLIX</p>
  `);
}

export function brandInquiryConfirmationEmail(contactPerson: string, brandName: string): string {
  return wrapper(`
    <p>Hello ${contactPerson},</p>
    <p>Thank you. ${brandName}'s inquiry has been received by VIDLIX.</p>
    <p>Our team will review your requirements and reach out shortly.</p>
    <p>Regards,<br/>VIDLIX</p>
  `);
}

export function agreementReadyEmail(opts: {
  creatorName: string;
  agreementNumber: string;
  validityText: string;
  signingUrl: string;
}): string {
  return wrapper(`
    <p>Hello ${opts.creatorName},</p>
    <p>VIDLIX has prepared an agreement for your review and signature.</p>
    <table style="width:100%; margin:16px 0; font-size:13px;">
      <tr><td style="color:#6b7280; padding:4px 0;">Agreement Number</td><td style="text-align:right; font-weight:600;">${opts.agreementNumber}</td></tr>
      <tr><td style="color:#6b7280; padding:4px 0;">Validity</td><td style="text-align:right;">${opts.validityText}</td></tr>
    </table>
    <p style="text-align:center; margin:28px 0;">
      <a href="${opts.signingUrl}" style="background:#6D28D9; color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:600; display:inline-block;">Review &amp; Sign</a>
    </p>
    <p>You do not need to create an account — the link above will guide you through a secure review, verification and e-signature process.</p>
    <p>Regards,<br/>VIDLIX</p>
  `);
}

export function agreementCompletedEmail(opts: {
  creatorName: string;
  agreementNumber: string;
  downloadUrl: string;
}): string {
  return wrapper(`
    <p>Hello ${opts.creatorName},</p>
    <p>Your agreement <strong>${opts.agreementNumber}</strong> has been successfully completed.</p>
    <p style="text-align:center; margin:28px 0;">
      <a href="${opts.downloadUrl}" style="background:#111827; color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:600; display:inline-block;">Download Signed Agreement</a>
    </p>
    <p>Regards,<br/>VIDLIX</p>
  `);
}

export function creatorEmailCreatedEmail(opts: { creatorName: string; emailAddress: string }): string {
  return wrapper(`
    <p>Hello ${opts.creatorName},</p>
    <p>Your official creator email is:</p>
    <p style="text-align:center; font-size:18px; font-weight:700; margin:20px 0;">${opts.emailAddress}</p>
    <p>You may add this email to your social profile/bio. This mailbox is managed by VIDLIX on your behalf.</p>
    <p>Regards,<br/>VIDLIX</p>
  `);
}

export function invoiceCreatedEmail(opts: {
  recipientName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
}): string {
  return wrapper(`
    <p>Hello ${opts.recipientName},</p>
    <p>A new invoice has been issued.</p>
    <table style="width:100%; margin:16px 0; font-size:13px;">
      <tr><td style="color:#6b7280; padding:4px 0;">Invoice Number</td><td style="text-align:right; font-weight:600;">${opts.invoiceNumber}</td></tr>
      <tr><td style="color:#6b7280; padding:4px 0;">Amount</td><td style="text-align:right; font-weight:600;">${opts.amount}</td></tr>
      <tr><td style="color:#6b7280; padding:4px 0;">Due Date</td><td style="text-align:right;">${opts.dueDate}</td></tr>
    </table>
    <p>Regards,<br/>VIDLIX</p>
  `);
}

export function paymentReceivedEmail(opts: { recipientName: string; invoiceNumber: string; amount: string }): string {
  return wrapper(`
    <p>Hello ${opts.recipientName},</p>
    <p>We have recorded a payment against invoice <strong>${opts.invoiceNumber}</strong>.</p>
    <p style="text-align:center; font-size:18px; font-weight:700; margin:20px 0;">${opts.amount}</p>
    <p>Regards,<br/>VIDLIX</p>
  `);
}

export function payoutReleasedEmail(opts: { creatorName: string; amount: string }): string {
  return wrapper(`
    <p>Hello ${opts.creatorName},</p>
    <p>Your payout has been released.</p>
    <p style="text-align:center; font-size:18px; font-weight:700; margin:20px 0;">${opts.amount}</p>
    <p>Please refer to your payout statement for complete details.</p>
    <p>Regards,<br/>VIDLIX</p>
  `);
}

export function otpEmail(opts: { code: string }): string {
  return wrapper(`
    <p>Your VIDLIX verification code is:</p>
    <p style="text-align:center; font-size:32px; font-weight:700; letter-spacing:0.2em; margin:20px 0;">${opts.code}</p>
    <p>This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>
  `);
}
