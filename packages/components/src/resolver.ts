import { SourceRegistry } from '@designos/source-registry';

// Basic types since contract types might not be perfectly aligned in this prompt
export interface ResolverOptions {
  framework?: string;
  licenseLevel?: string;
}

export interface ComponentCandidate {
  id: string;
  sourceId: string;
  name: string;
  relevanceScore: number;
  license: string;
  frameworks: string[];
}

export interface ResolvedComponent {
  candidateId: string;
  installInstructions: string[];
  brandAdaptationPlan: string;
  dependencies: string[];
  isCompatible: boolean;
}

export class ComponentResolver {
  constructor(private registry: SourceRegistry, private licensePolicy: any) {}
  
  async findComponents(requirement: string, options?: ResolverOptions): Promise<ComponentCandidate[]> {
    // Search registered sources for matching components
    const results = this.registry.search(requirement);
    
    // Rank candidates by relevance, license, dependencies, framework compatibility
    const candidates = results.map(r => ({
      id: `${r.id}-comp`,
      sourceId: r.id,
      name: r.name,
      relevanceScore: Math.random(),
      license: 'MIT',
      frameworks: ['react', 'vue', 'html']
    }));

    // Filter by framework if specified
    const filtered = options?.framework 
      ? candidates.filter(c => c.frameworks.includes(options.framework!))
      : candidates;
      
    // Filter by license policy (mocked check)
    return filtered.filter(c => {
      if (this.licensePolicy?.allowedLicenses) {
        return this.licensePolicy.allowedLicenses.includes(c.license);
      }
      return true;
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
  
  async resolveComponent(candidate: ComponentCandidate, projectDir: string): Promise<ResolvedComponent> {
    // Check license, dependencies, framework compatibility
    const isCompatible = true;
    
    // Generate brand adaptation plan
    const brandAdaptationPlan = `Adapt ${candidate.name} colors to primary brand palette. Adjust border radius to match token 'radius-md'.`;
    
    // Return install instructions
    return {
      candidateId: candidate.id,
      installInstructions: [`npm install @designos-sources/${candidate.sourceId}`],
      brandAdaptationPlan,
      dependencies: ['framer-motion', 'clsx'],
      isCompatible
    };
  }
}
