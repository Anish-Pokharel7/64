export const colors = {
  primary: '#E23744',
  primaryDark: '#C42D3A',
  primaryLight: '#F5A8AE',
  primaryUltraLight: '#FFF0F1',

  background: '#FAFAFB',
  surface: '#FFFFFF',
  surfaceSecondary: '#F5F6F8',

  textPrimary: '#1A1D26',
  textSecondary: '#5C6070',
  textMuted: '#9CA3B0',

  border: '#E8E9EE',
  borderDark: '#D1D5DB',

  success: '#22C55E',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',

  star: '#FFB800',
} as const;

export type ColorName = keyof typeof colors;
