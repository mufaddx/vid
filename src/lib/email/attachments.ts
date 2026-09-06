import type { EmailAttachment } from "@/lib/email/send";

const MAX_TOTAL_BYTES = 10 * 1024 * 1024; // 10MB combined cap

/** Reads uploaded files from a FormData field (server actions receive real
 * `File` objects for file inputs) and converts them into EmailAttachment[]
 * ready for sendEmail(). Empty/zero-byte entries (an untouched <input
 * type="file">) are skipped. Throws if the combined size is too large. */
export async function readAttachmentsFromFormData(
  formData: FormData,
  fieldName: string,
): Promise<EmailAttachment[]> {
  const files = formData.getAll(fieldName).filter((f): f is File => f instanceof File && f.size > 0);
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  if (totalBytes > MAX_TOTAL_BYTES) {
    throw new Error("Attachments exceed the 10MB combined size limit.");
  }
  return Promise.all(
    files.map(async (file) => ({
      filename: file.name || "attachment",
      content: Buffer.from(await file.arrayBuffer()),
    })),
  );
}
