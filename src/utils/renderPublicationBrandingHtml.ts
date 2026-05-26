import type { EventPublicationBranding, PublicationBrandingFooter } from '@/types/publicationBranding';

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

export function renderPublicationFooterHtml(footer: PublicationBrandingFooter): string {
  return `
    <div class="publication-helpline-footer" style="margin-top: 48px; padding-top: 32px; border-top: 1px solid #e5e7eb;">
      <div style="background: #DFCCAE; border-radius: 8px; padding: 24px; text-align: center;">
        <div style="color: #1f2937; font-size: 14px; line-height: 1.625;">
          <p style="margin: 0 0 8px; font-weight: 600;">${escapeHtml(footer.title)}</p>
          <p style="margin: 0 0 8px;">
            ${escapeHtml(footer.contactLead)}
            <a href="${escapeHtml(footer.whatsappUrl)}" target="_blank" rel="noopener noreferrer" style="color: #286741; text-decoration: underline; font-weight: 500;">${escapeHtml(footer.whatsappLabel)}</a>
            <br />
            ${escapeHtml(footer.contactMiddle)}
            <a href="tel:${escapeHtml(footer.phoneTel)}" style="color: #286741; text-decoration: underline; font-weight: 500;">${escapeHtml(footer.phoneLabel)}</a>
            ${escapeHtml(footer.hoursText)}
          </p>
          <p style="margin: 0; font-style: italic;">${escapeHtml(footer.note)}</p>
        </div>
      </div>
    </div>
  `;
}
