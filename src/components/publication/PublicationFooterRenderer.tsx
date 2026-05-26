import React from 'react';
import type { PublicationBrandingFooter } from '@/types/publicationBranding';

interface PublicationFooterRendererProps {
  footer: PublicationBrandingFooter;
}

export const PublicationFooterRenderer: React.FC<PublicationFooterRendererProps> = ({
  footer,
}) => {
  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="bg-[#DFCCAE] rounded-lg p-6 md:text-center text-left">
        <div className="text-gray-800 text-sm leading-relaxed">
          <p className="mb-2 font-semibold">{footer.title}</p>
          <p className="mb-2">
            {footer.contactLead}{' '}
            <a
              href={footer.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#286741] underline font-medium"
            >
              {footer.whatsappLabel}
            </a>{' '}
            <br />
            {footer.contactMiddle}{' '}
            <a
              href={`tel:${footer.phoneTel}`}
              className="text-[#286741] underline font-medium"
            >
              {footer.phoneLabel}
            </a>{' '}
            {footer.hoursText}
          </p>
          <p className="mb-2 italic">{footer.note}</p>
        </div>
      </div>
    </div>
  );
};
