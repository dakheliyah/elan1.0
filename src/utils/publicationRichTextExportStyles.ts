/**
 * Standalone CSS for rich text blocks in exported HTML.
 * Used by publicationExport and PublicationPreview DOM export so lists,
 * line spacing, and RTL typography match the in-app preview.
 */
export function getPublicationRichTextExportStyles(): string {
  return `
    .publication-rich-text {
      line-height: 1.6;
      color: #374151;
      font-size: 15px;
    }
    .publication-rich-text[dir="rtl"] {
      line-height: 1.8;
      font-size: 24px;
      text-align: right;
      font-family: "Al-Kanz", "Noto Sans Arabic", "Amiri", "Traditional Arabic", Arial, sans-serif;
      unicode-bidi: plaintext;
    }
    .publication-rich-text p {
      margin: 0.5rem 0;
      line-height: inherit;
      white-space: pre-wrap;
    }
    .publication-rich-text p:empty {
      margin: 0.5rem 0;
      min-height: 1.2em;
    }
    .publication-rich-text p:empty + p:empty {
      margin-top: 0;
    }
    .publication-rich-text br {
      line-height: inherit;
    }
    .publication-rich-text h1,
    .publication-rich-text h2,
    .publication-rich-text h3,
    .publication-rich-text h4,
    .publication-rich-text h5,
    .publication-rich-text h6 {
      font-weight: bold;
      margin: 1rem 0 0.5rem 0;
      line-height: 1.4;
      white-space: normal;
    }
    .publication-rich-text h1 { font-size: 2rem; }
    .publication-rich-text h2 { font-size: 1.5rem; }
    .publication-rich-text h3 { font-size: 1.25rem; }
    .publication-rich-text h4 { font-size: 1.125rem; }
    .publication-rich-text h5 { font-size: 1rem; }
    .publication-rich-text h6 { font-size: 0.875rem; }
    .publication-rich-text ul,
    .publication-rich-text ol {
      white-space: normal;
      list-style-position: outside;
      padding-left: 1.5rem;
      margin: 0.5rem 0;
    }
    .publication-rich-text ul {
      list-style-type: disc;
    }
    .publication-rich-text ol {
      list-style-type: decimal;
    }
    .publication-rich-text li {
      display: list-item;
      white-space: normal;
      margin: 0.25rem 0;
      line-height: inherit;
    }
    .publication-rich-text li p {
      margin: 0;
      white-space: pre-wrap;
    }
    .publication-rich-text ul ul,
    .publication-rich-text ol ol,
    .publication-rich-text ul ol,
    .publication-rich-text ol ul {
      margin: 0.25rem 0;
      padding-left: 1.25rem;
    }
    .publication-rich-text ul ul {
      list-style-type: circle;
    }
    .publication-rich-text ul ul ul {
      list-style-type: square;
    }
    .publication-rich-text[dir="rtl"] ul,
    .publication-rich-text[dir="rtl"] ol {
      padding-right: 1.5rem;
      padding-left: 0;
    }
    .publication-rich-text[dir="rtl"] ul ul,
    .publication-rich-text[dir="rtl"] ol ol,
    .publication-rich-text[dir="rtl"] ul ol,
    .publication-rich-text[dir="rtl"] ol ul {
      padding-right: 1.25rem;
      padding-left: 0;
    }
    .publication-rich-text strong { font-weight: bold; }
    .publication-rich-text em { font-style: italic; }
    .publication-rich-text u { text-decoration: underline; }
    .publication-rich-text s { text-decoration: line-through; }
    .publication-rich-text a {
      color: #286741;
      text-decoration: underline;
    }
    .publication-rich-text > *:first-child { margin-top: 0; }
    .publication-rich-text > *:last-child { margin-bottom: 0; }
  `;
}
