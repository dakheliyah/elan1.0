export interface EventPublicationBranding {
  header: {
    line1: string;
    line2: string;
  };
  footer: {
    title: string;
    contactLead: string;
    whatsappLabel: string;
    whatsappUrl: string;
    contactMiddle: string;
    phoneLabel: string;
    phoneTel: string;
    hoursText: string;
    note: string;
  };
}

export type PublicationBrandingFooter = EventPublicationBranding['footer'];
export type PublicationBrandingHeader = EventPublicationBranding['header'];
