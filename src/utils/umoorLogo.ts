const EMOJI_MAP: Record<string, string> = {
  waaz: '📿',
  majlis: '🌙',
  food: '🍽️',
  accommodation: '🏠',
  transport: '🚌',
  health: '⚕️',
  registration: '📝',
  general: 'ℹ️',
};

export interface UmoorLogoSource {
  logo_url?: string | null;
  name?: string;
  slug?: string | null;
}

export function getUmoorLogoDisplay(umoor: UmoorLogoSource): string {
  if (umoor.logo_url) {
    return umoor.logo_url;
  }

  const key = Object.keys(EMOJI_MAP).find(
    (k) =>
      umoor.name?.toLowerCase().includes(k) || umoor.slug?.includes(k)
  );

  return key ? EMOJI_MAP[key] : '📋';
}

export function isEmojiLogo(logo: string): boolean {
  return !logo.startsWith('http') && !logo.startsWith('data:');
}
