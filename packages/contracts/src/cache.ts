export interface ExactCacheEntry {
  key: string;
  value: unknown;
  timestamp: string;
}

export interface SemanticCacheEntry {
  embedding: number[];
  value: unknown;
  timestamp: string;
}
