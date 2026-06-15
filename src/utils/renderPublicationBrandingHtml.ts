import type { EventPublicationBranding, PublicationBrandingFooter } from '@/types/publicationBranding';
import {
  hasFooterContactContent,
  hasPublicationFooterContent,
  isNonBlank,
} from '@/utils/publicationFooterContent';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderPublicationHeaderSubtitleHtml(
  header: EventPublicationBranding['header']
): string {
  return `${escapeHtml(header.line1)}<br />${escapeHtml(header.line2)}`;
}

function renderContactFooterHtml(footer: PublicationBrandingFooter): string {
  const hasWhatsApp =
    isNonBlank(footer.whatsappLabel) && isNonBlank(footer.whatsappUrl);
  const hasPhone = isNonBlank(footer.phoneLabel) && isNonBlank(footer.phoneTel);

  const whatsappLineParts: string[] = [];
  if (isNonBlank(footer.contactLead)) {
    whatsappLineParts.push(escapeHtml(footer.contactLead));
  }
  if (hasWhatsApp) {
    whatsappLineParts.push(
      `<a href="${escapeHtml(footer.whatsappUrl)}" target="_blank" rel="noopener noreferrer" style="color: #286741; text-decoration: underline; font-weight: 500;">${escapeHtml(footer.whatsappLabel)}</a>`
    );
  }

  const phoneLineParts: string[] = [];
  if (isNonBlank(footer.contactMiddle)) {
    phoneLineParts.push(escapeHtml(footer.contactMiddle));
  }
  if (hasPhone) {
    phoneLineParts.push(
      `<a href="tel:${escapeHtml(footer.phoneTel)}" style="color: #286741; text-decoration: underline; font-weight: 500;">${escapeHtml(footer.phoneLabel)}</a>`
    );
  }
  if (isNonBlank(footer.hoursText)) {
    phoneLineParts.push(escapeHtml(footer.hoursText));
  }

  if (whatsappLineParts.length === 0 && phoneLineParts.length === 0) {
    return '';
  }

  const whatsappLine = whatsappLineParts.join(' ');
  const phoneLine = phoneLineParts.join(' ');
  const lineBreak =
    whatsappLineParts.length > 0 && phoneLineParts.length > 0 ? '<br />' : '';

  return `<p style="margin: 0;">${whatsappLine}${lineBreak}${phoneLine}</p>`;
}

export function renderPublicationFooterHtml(footer: PublicationBrandingFooter): string {
  if (!hasPublicationFooterContent(footer)) {
    return '';
  }

  const sections: string[] = [];

  if (isNonBlank(footer.title)) {
    sections.push(
      `<p style="margin: 0; font-weight: 600;">${escapeHtml(footer.title)}</p>`
    );
  }

  const contactHtml = hasFooterContactContent(footer)
    ? renderContactFooterHtml(footer)
    : '';
  if (contactHtml) {
    sections.push(contactHtml);
  }

  if (isNonBlank(footer.note)) {
    sections.push(
      `<p style="margin: 0; font-style: italic;">${escapeHtml(footer.note)}</p>`
    );
  }

  return `
    <div class="publication-helpline-footer" style="margin-top: 48px; padding: 32px 0; border-top: 1px solid #e5e7eb;">
      <div style="background: #DFCCAE; border-radius: 8px; padding: 24px; text-align: center;">
        <div style="color: #1f2937; font-size: 14px; line-height: 1.625; display: flex; flex-direction: column; gap: 8px;">
          ${sections.join('')}
        </div>
      </div>
    </div>
  `;
}
