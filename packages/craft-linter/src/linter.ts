import { CraftKernel, CraftRule } from '@designos/craft';

export interface LintTarget { id: string; elements: any[]; }
export interface LintFinding { ruleId: string; severity: string; message: string; }
export interface LintResult { findings: LintFinding[]; summary: string; }

export class CraftLinter {
  constructor(private craft: CraftKernel) {}
  
  lint(implementation: LintTarget, modules?: string[]): LintResult {
    const rules = this.craft.getRules(modules ?? ['typography', 'color', 'spacing', 'accessibility']);
    const findings: LintFinding[] = [];
    
    for (const rule of rules) {
      const result = this.evaluateRule(rule, implementation);
      if (result) findings.push(result);
    }
    
    return { findings, summary: this.summarize(findings) };
  }
  
  private evaluateRule(rule: CraftRule, target: LintTarget): LintFinding | null {
    if (rule.logic) {
      if (!rule.logic(target)) return { ruleId: rule.id, severity: rule.severity, message: rule.check };
      return null;
    }
    // Mock simulation
    if (target.elements.some(e => e.type === 'error' && e.ruleId === rule.id)) {
      return { ruleId: rule.id, severity: rule.severity, message: rule.check };
    }
    return null;
  }
  
  private summarize(findings: LintFinding[]): string {
    return `Found ${findings.length} issues (${findings.filter(f => f.severity === 'error').length} errors)`;
  }
}
