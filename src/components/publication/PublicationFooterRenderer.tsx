import React from 'react';
import type { PublicationBrandingFooter } from '@/types/publicationBranding';
import {
  hasFooterContactContent,
  hasPublicationFooterContent,
  isNonBlank,
} from '@/utils/publicationFooterContent';

interface PublicationFooterRendererProps {
  footer: PublicationBrandingFooter;
}

function renderContactContent(footer: PublicationBrandingFooter): React.ReactNode {
  const hasWhatsApp =
    isNonBlank(footer.whatsappLabel) && isNonBlank(footer.whatsappUrl);
  const hasPhone = isNonBlank(footer.phoneLabel) && isNonBlank(footer.phoneTel);

  const whatsappLine = [
    isNonBlank(footer.contactLead) ? footer.contactLead : null,
    hasWhatsApp ? (
      <a
        key="whatsapp"
        href={footer.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#286741] underline font-medium"
      >
        {footer.whatsappLabel}
      </a>
    ) : null,
  ].filter(Boolean);

  const phoneLine = [
    isNonBlank(footer.contactMiddle) ? footer.contactMiddle : null,
    hasPhone ? (
      <a
        key="phone"
        href={`tel:${footer.phoneTel}`}
        className="text-[#286741] underline font-medium"
      >
        {footer.phoneLabel}
      </a>
    ) : null,
    isNonBlank(footer.hoursText) ? footer.hoursText : null,
  ].filter(Boolean);

  if (whatsappLine.length === 0 && phoneLine.length === 0) {
    return null;
  }

  return (
    <p>
      {whatsappLine.map((part, index) => (
        <React.Fragment key={`whatsapp-${index}`}>
          {index > 0 ? ' ' : null}
          {part}
        </React.Fragment>
      ))}
      {whatsappLine.length > 0 && phoneLine.length > 0 ? <br /> : null}
      {phoneLine.map((part, index) => (
        <React.Fragment key={`phone-${index}`}>
          {index > 0 ? ' ' : null}
          {part}
        </React.Fragment>
      ))}
    </p>
  );
}

export const PublicationFooterRenderer: React.FC<PublicationFooterRendererProps> = ({
  footer,
}) => {
  if (!hasPublicationFooterContent(footer)) {
    return null;
  }

  const contactContent = hasFooterContactContent(footer)
    ? renderContactContent(footer)
    : null;

  return (
    <div className="mt-12 py-8 border-t border-gray-200">
      <div className="bg-[#DFCCAE] rounded-lg px-6 py-6 md:text-center text-left">
        <div className="text-gray-800 text-sm leading-relaxed space-y-2">
          {isNonBlank(footer.title) ? (
            <p className="font-semibold">{footer.title}</p>
          ) : null}
          {contactContent}
          {isNonBlank(footer.note) ? (
            <p className="italic">{footer.note}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};
