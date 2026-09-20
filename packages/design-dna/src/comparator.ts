import { DesignDNA } from './extractor';

export interface DesignDNADiff {
  addedColors: string[];
  removedColors: string[];
}

export class DNAComparator {
  similarity(a: DesignDNA, b: DesignDNA): number {
    let score = 0;
    if (a.colors.length && b.colors.length && a.colors[0] === b.colors[0]) score += 0.5;
    if (a.typography.length && b.typography.length && a.typography[0] === b.typography[0]) score += 0.5;
    return score;
  }

  diff(a: DesignDNA, b: DesignDNA): DesignDNADiff {
    return {
      addedColors: b.colors.filter(c => !a.colors.includes(c)),
      removedColors: a.colors.filter(c => !b.colors.includes(c))
    };
  }
}
