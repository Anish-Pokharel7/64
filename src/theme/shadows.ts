import { Platform, ViewStyle } from 'react-native';

function createShadow(
  boxShadow: string,
  shadowColor: string,
  shadowOffset: { width: number; height: number },
  shadowOpacity: number,
  shadowRadius: number,
  elevation: number
): ViewStyle {
  return Platform.select<ViewStyle>({
    web: { boxShadow },
    default: { shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation },
  }) ?? {};
}

export const shadows = {
  none: createShadow('none', 'transparent', { width: 0, height: 0 }, 0, 0, 0),
  sm: createShadow('0px 1px 3px rgba(26, 29, 38, 0.06)', '#1A1D26', { width: 0, height: 1 }, 0.06, 3, 2),
  md: createShadow('0px 2px 6px rgba(26, 29, 38, 0.08)', '#1A1D26', { width: 0, height: 2 }, 0.08, 6, 4),
  lg: createShadow('0px 4px 12px rgba(26, 29, 38, 0.1)', '#1A1D26', { width: 0, height: 4 }, 0.1, 12, 8),
  xl: createShadow('0px 8px 24px rgba(26, 29, 38, 0.12)', '#1A1D26', { width: 0, height: 8 }, 0.12, 24, 12),
} as const;

export type ShadowKey = keyof typeof shadows;
