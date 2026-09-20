export interface CraftRule { id: string; severity: 'error'|'warning'|'guidance'; check: string; logic?: (impl: any) => boolean; }
export interface CraftModule { name: string; rules: CraftRule[]; }
export interface CraftEvaluation { passed: boolean; failedRules: string[]; }

export class CraftKernel {
  private rules = new Map<string, CraftRule[]>();
  
  loadModule(module: CraftModule): void {
    this.rules.set(module.name, module.rules);
  }
  
  getRules(modules: string[]): CraftRule[] {
    const combined: CraftRule[] = [];
    for (const m of modules) {
      combined.push(...(this.rules.get(m) || []));
    }
    return combined;
  }
  
  evaluate(implementation: any, modules: string[]): CraftEvaluation {
    const activeRules = this.getRules(modules);
    const failedRules: string[] = [];
    
    for (const rule of activeRules) {
      if (rule.logic && !rule.logic(implementation)) {
        failedRules.push(rule.id);
      }
    }
    return { passed: failedRules.length === 0, failedRules };
  }
}
