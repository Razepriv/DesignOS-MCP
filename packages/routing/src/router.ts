import { rankSources, DesignSource, RankedSource } from './ranking';

export interface RouterOptions {
  maxSources?: number;
}

export interface RoutedSources {
  sources: RankedSource[];
}

export class Router {
  route(query: string, sources: DesignSource[], options?: RouterOptions): RoutedSources {
    const maxSources = options?.maxSources || 5;
    const ranked = rankSources(query, sources);
    return {
      sources: ranked.slice(0, maxSources)
    };
  }
}
