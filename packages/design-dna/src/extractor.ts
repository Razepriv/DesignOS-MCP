export interface DesignDNA {
  colors: string[];
  typography: string[];
  spacing: number[];
  motion: string[];
}

export class DNAExtractor {
  extractFromHTML(html: string, url: string): Partial<DesignDNA> {
    return { typography: ['Inter', 'sans-serif'] };
  }
  
  extractFromScreenshot(imagePath: string): Partial<DesignDNA> {
    return { colors: ['#ffffff', '#000000'] };
  }
  
  extractFromCSS(css: string): Partial<DesignDNA> {
    return { spacing: [4, 8, 16, 24] };
  }
  
  merge(dnas: Partial<DesignDNA>[]): DesignDNA {
    const res: DesignDNA = { colors: [], typography: [], spacing: [], motion: [] };
    for (const d of dnas) {
      if (d.colors) res.colors.push(...d.colors);
      if (d.typography) res.typography.push(...d.typography);
      if (d.spacing) res.spacing.push(...d.spacing);
      if (d.motion) res.motion.push(...d.motion);
    }
    return res;
  }
}
