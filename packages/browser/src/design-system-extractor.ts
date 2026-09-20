import { ExtractedDesignSystem } from './playwright-adapter.js';

export async function extractDesignSystemFromPage(page: any): Promise<ExtractedDesignSystem> {
  return await page.evaluate(() => {
    const colors = new Set<string>();
    const fonts = new Set<string>();
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
      const styles = window.getComputedStyle(el);
      if (styles.color) colors.add(styles.color);
      if (styles.backgroundColor) colors.add(styles.backgroundColor);
      if (styles.fontFamily) fonts.add(styles.fontFamily);
    });
    return {
      colors: Array.from(colors),
      fonts: Array.from(fonts)
    };
  });
}
