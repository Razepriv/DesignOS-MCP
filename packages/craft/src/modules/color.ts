export const colorRules = [
  { id: 'contrast-ratio', severity: 'error', check: 'WCAG 2.1 AA contrast ratio (4.5:1 for normal text)' },
  { id: 'color-harmony', severity: 'guidance', check: 'Maintain complementary or analogous color harmony' },
  { id: 'brand-alignment', severity: 'warning', check: 'Colors must match brand guidelines' },
  { id: 'semantic-colors', severity: 'error', check: 'Red for destructive, green for success' },
  { id: 'dark-mode-inversion', severity: 'warning', check: 'Properly invert colors in dark mode' }
];
