export type ThemeId = 'cyber-volt' | 'obsidian-cobalt' | 'crimson-iron' | 'matrix-emerald' | 'luxury-gold';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  tagline: string;
  badge: string;
  previewBg: string;
  previewPrimary: string;
  previewAccent: string;
  swatches: string[];
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'cyber-volt',
    name: 'Cyber Volt',
    tagline: 'Acid Volt & Stealth Obsidian (Nike Pro / Whoop)',
    badge: 'High Energy',
    previewBg: '#0A0B0E',
    previewPrimary: '#CCFF00',
    previewAccent: '#00F0FF',
    swatches: ['#0A0B0E', '#141720', '#232A3A', '#CCFF00', '#00F0FF', '#FF5C39'],
  },
  {
    id: 'obsidian-cobalt',
    name: 'Obsidian Cobalt',
    tagline: 'Electric Royal & Ice Cyan (Apple Fitness+)',
    badge: 'Pro Telemetry',
    previewBg: '#080A12',
    previewPrimary: '#2563EB',
    previewAccent: '#38BDF8',
    swatches: ['#080A12', '#111625', '#202B44', '#2563EB', '#38BDF8', '#FB923C'],
  },
  {
    id: 'crimson-iron',
    name: 'Crimson Iron',
    tagline: 'Power Red & Gunmetal Slate (Gymshark / Rogue)',
    badge: 'Heavy Strength',
    previewBg: '#0D0D11',
    previewPrimary: '#E11D48',
    previewAccent: '#FB923C',
    swatches: ['#0D0D11', '#171720', '#2B2B3B', '#E11D48', '#FB7185', '#F97316'],
  },
  {
    id: 'matrix-emerald',
    name: 'Matrix Emerald',
    tagline: 'Neon Emerald & Forest Obsidian (Bio-Tracker)',
    badge: 'Stamina & Flow',
    previewBg: '#080E0C',
    previewPrimary: '#10B981',
    previewAccent: '#34D399',
    swatches: ['#080E0C', '#121E19', '#223A30', '#10B981', '#34D399', '#FB923C'],
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Onyx & Gold',
    tagline: 'Champagne Gold & Velvet Carbon (Equinox Studio)',
    badge: 'Executive Clean',
    previewBg: '#09090B',
    previewPrimary: '#E5C07B',
    previewAccent: '#F59E0B',
    swatches: ['#09090B', '#16161A', '#2C2C34', '#E5C07B', '#F59E0B', '#FAFAFA'],
  },
];

const STORAGE_KEY = 'hyten_active_theme_v3';

export function getActiveTheme(): ThemeId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId;
    if (saved && THEME_OPTIONS.some(t => t.id === saved)) {
      return saved;
    }
  } catch (e) {}
  return 'cyber-volt'; // Default to the highest-energy modern athletic look
}

export function setActiveTheme(themeId: ThemeId): void {
  try {
    localStorage.setItem(STORAGE_KEY, themeId);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeId);
      window.dispatchEvent(new CustomEvent('hyten_theme_change', { detail: themeId }));
    }
  } catch (e) {}
}

export function initTheme(): void {
  if (typeof document !== 'undefined') {
    const theme = getActiveTheme();
    document.documentElement.setAttribute('data-theme', theme);
  }
}
