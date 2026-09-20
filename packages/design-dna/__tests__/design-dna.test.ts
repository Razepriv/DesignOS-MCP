import { describe, it, expect } from 'vitest';
import { DNAExtractor } from '../src/extractor';
import { DNAComparator } from '../src/comparator';

describe('Design DNA', () => {
  it('extractor should merge correctly', () => {
    const ext = new DNAExtractor();
    const merged = ext.merge([{ colors: ['#fff'] }, { typography: ['Inter'] }]);
    expect(merged.colors).toContain('#fff');
    expect(merged.typography).toContain('Inter');
  });

  it('comparator should diff correctly', () => {
    const comp = new DNAComparator();
    const d = comp.diff(
      { colors: ['#000'], typography: [], spacing: [], motion: [] },
      { colors: ['#fff'], typography: [], spacing: [], motion: [] }
    );
    expect(d.addedColors).toContain('#fff');
    expect(d.removedColors).toContain('#000');
  });
});
