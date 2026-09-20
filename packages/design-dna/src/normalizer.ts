export class DNANormalizer {
  normalizeColors(computedStyles: any) {
    return ['#000', '#fff'];
  }
  normalizeTypography(computedStyles: any) {
    return { family: 'Inter', size: 16 };
  }
  normalizeSpacing(computedStyles: any) {
    return [4, 8, 16];
  }
  normalizeMotion(animations: any) {
    return { type: 'minimal' };
  }
}
