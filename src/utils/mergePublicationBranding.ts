import { defaultPublicationBranding } from '@/constants/defaultPublicationBranding';
import type { EventPublicationBranding } from '@/types/publicationBranding';
import type { Json } from '@/integrations/supabase/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pickString(
  source: Record<string, unknown> | undefined,
  key: string,
  fallback: string
): string {
  const value = source?.[key];
  return typeof value === 'string' ? value : fallback;
}

export function mergePublicationBranding(
  stored: Json | null | undefined
): EventPublicationBranding {
  if (!isRecord(stored)) {
    return defaultPublicationBranding;
  }

  const header = isRecord(stored.header) ? stored.header : undefined;
  const footer = isRecord(stored.footer) ? stored.footer : undefined;

  return {
    header: {
      line1: pickString(header, 'line1', defaultPublicationBranding.header.line1),
      line2: pickString(header, 'line2', defaultPublicationBranding.header.line2),
    },
    footer: {
      title: pickString(footer, 'title', defaultPublicationBranding.footer.title),
      contactLead: pickString(footer, 'contactLead', defaultPublicationBranding.footer.contactLead),
      whatsappLabel: pickString(footer, 'whatsappLabel', defaultPublicationBranding.footer.whatsappLabel),
      whatsappUrl: pickString(footer, 'whatsappUrl', defaultPublicationBranding.footer.whatsappUrl),
      contactMiddle: pickString(footer, 'contactMiddle', defaultPublicationBranding.footer.contactMiddle),
      phoneLabel: pickString(footer, 'phoneLabel', defaultPublicationBranding.footer.phoneLabel),
      phoneTel: pickString(footer, 'phoneTel', defaultPublicationBranding.footer.phoneTel),
      hoursText: pickString(footer, 'hoursText', defaultPublicationBranding.footer.hoursText),
      note: pickString(footer, 'note', defaultPublicationBranding.footer.note),
    },
  };
}
