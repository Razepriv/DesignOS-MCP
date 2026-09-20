import { generateColorTokens, generateTypographyTokens, generateSpacingTokens, generateRadiusTokens, generateShadowTokens, generateMotionTokens } from './token-generator.js';

export interface ApprovedDirection { moodboardId: string; keptItems: any[]; }
export interface BrandSystem { id: string; projectId: string; palette: any[]; typography: any; spacingSystem: string; radiusScale: string; shadowStyle: string; motionConfig: any; }
export interface DesignTokenSet { colors: any; typography: any; spacing: any; radius: any; shadows: any; motion: any; }

export class BrandGenerator {
  constructor(private db: any) {}
  
  generate(projectId: string, direction: ApprovedDirection): BrandSystem { 
    return {
      id: 'bs-' + projectId,
      projectId,
      palette: [{ name: 'primary', value: '#000000' }],
      typography: { fontFamily: 'Inter' },
      spacingSystem: '8px',
      radiusScale: '4px',
      shadowStyle: 'soft',
      motionConfig: { defaultEasing: 'ease-in-out' }
    };
  }
  
  generateTokens(brandSystem: BrandSystem): DesignTokenSet {
    return {
      colors: generateColorTokens(brandSystem.palette),
      typography: generateTypographyTokens(brandSystem.typography),
      spacing: generateSpacingTokens(brandSystem.spacingSystem),
      radius: generateRadiusTokens(brandSystem.radiusScale),
      shadows: generateShadowTokens(brandSystem.shadowStyle),
      motion: generateMotionTokens(brandSystem.motionConfig)
    };
  }
  
  exportCSS(tokens: DesignTokenSet): string { 
    return `:root {\n  --color-primary: ${tokens.colors.primary};\n}`;
  }
  
  exportTailwind(tokens: DesignTokenSet): string { 
    return `module.exports = { theme: { extend: { colors: ${JSON.stringify(tokens.colors)} } } };`;
  }
  
  exportJSON(tokens: DesignTokenSet): object { 
    return tokens;
  }
  
  exportFigma(tokens: DesignTokenSet): object { 
    return { "global": { "colors": { "type": "color", "value": tokens.colors.primary } } };
  }
}
