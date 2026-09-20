export interface PaletteEntry { name: string; value: string; }
export interface TypographyConfig { fontFamily: string; }
export interface MotionConfig { defaultEasing: string; }
export interface ColorTokens { [key: string]: string; }
export interface TypographyTokens { fontFamily: string; }
export interface SpacingTokens { base: string; }
export interface RadiusTokens { base: string; }
export interface ShadowTokens { base: string; }
export interface MotionTokens { defaultEasing: string; }

export function generateColorTokens(palette: PaletteEntry[]): ColorTokens { 
  const tokens: ColorTokens = {};
  for (const entry of palette) {
    tokens[entry.name] = entry.value;
  }
  return tokens;
}
export function generateTypographyTokens(typography: TypographyConfig): TypographyTokens { 
  return { fontFamily: typography.fontFamily };
}
export function generateSpacingTokens(spacingSystem: string): SpacingTokens { 
  return { base: spacingSystem };
}
export function generateRadiusTokens(radiusScale: string): RadiusTokens { 
  return { base: radiusScale };
}
export function generateShadowTokens(shadowStyle: string): ShadowTokens { 
  return { base: `0 4px 6px -1px rgba(0, 0, 0, 0.1)` };
}
export function generateMotionTokens(motionConfig: MotionConfig): MotionTokens { 
  return { defaultEasing: motionConfig.defaultEasing };
}
