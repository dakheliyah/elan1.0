import type { PublicationBrandingFooter } from '@/types/publicationBranding';

export function isNonBlank(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export function hasFooterContactContent(footer: PublicationBrandingFooter): boolean {
  return (
    isNonBlank(footer.contactLead) ||
    (isNonBlank(footer.whatsappLabel) && isNonBlank(footer.whatsappUrl)) ||
    isNonBlank(footer.contactMiddle) ||
    (isNonBlank(footer.phoneLabel) && isNonBlank(footer.phoneTel)) ||
    isNonBlank(footer.hoursText)
  );
}

export function hasPublicationFooterContent(footer: PublicationBrandingFooter): boolean {
  return (
    isNonBlank(footer.title) ||
    hasFooterContactContent(footer) ||
    isNonBlank(footer.note)
  );
}
