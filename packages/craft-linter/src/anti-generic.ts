import { LintTarget } from './linter.js';

export interface GenericPatternFinding { pattern: string; elementId: string; message: string; }

export function detectGenericPatterns(target: LintTarget): GenericPatternFinding[] {
  const findings: GenericPatternFinding[] = [];
  const knownPatterns = ['gradient-blob', 'excessive-glassmorphism', 'generic-saas-purple', 'excessive-pill-ui', 'fake-product-preview'];
  
  for (const el of target.elements) {
    if (knownPatterns.includes(el.style)) {
      findings.push({ pattern: el.style, elementId: el.id, message: `Avoid generic pattern: ${el.style}` });
    }
  }
  
  return findings;
}
