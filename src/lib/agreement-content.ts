// Agreement / template content model.
//
// Rather than storing arbitrary rich-text HTML (which is awkward to both
// preview live and render to a faithful A4 PDF), content is a structured
// list of sections — heading + body paragraphs — which the editor, the
// on-screen live preview, and the PDF renderer all consume identically.
// This still satisfies spec §46/§53 (headings, paragraphs, variables,
// page breaks) without needing a full WYSIWYG HTML pipeline.

export type AgreementSection = {
  id: string;
  heading: string;
  body: string; // paragraphs separated by blank lines; "---" forces a page break after
};

export function parseSections(content: string): AgreementSection[] {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed as AgreementSection[];
    return [];
  } catch {
    return [];
  }
}

export function stringifySections(sections: AgreementSection[]): string {
  return JSON.stringify(sections);
}

export function newSectionId(): string {
  return Math.random().toString(36).slice(2, 10);
}
