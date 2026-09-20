import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { ExactCache, SemanticCache, TokenGovernor, ProgressiveRetriever, RETRIEVAL_LEVELS } from '../src/index.js';

describe('Optimization Package', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
  });

  describe('ExactCache', () => {
    it('should set and get values', () => {
      const cache = new ExactCache(db);
      cache.set('testOp', { a: 1 }, { result: 'ok' });
      expect(cache.get('testOp', { a: 1 })).toEqual({ result: 'ok' });
      expect(cache.get('testOp', { a: 2 })).toBeNull();
    });

    it('should invalidate correctly', () => {
      const cache = new ExactCache(db);
      cache.set('testOp', { a: 1 }, { result: 'ok' });
      cache.invalidate('testOp', { a: 1 });
      expect(cache.has('testOp', { a: 1 })).toBe(false);
    });
  });

  describe('SemanticCache', () => {
    it('should find similar vectors', () => {
      const cache = new SemanticCache(db, 0.9);
      cache.set('intent1', [1, 0, 0], { id: 1 });
      
      const match = cache.find([0.9, 0.1, 0]);
      expect(match).not.toBeNull();
      expect(match?.result).toEqual({ id: 1 });
    });

    it('should not find dissimilar vectors', () => {
      const cache = new SemanticCache(db, 0.9);
      cache.set('intent1', [1, 0, 0], { id: 1 });
      
      const match = cache.find([0, 1, 0]);
      expect(match).toBeNull();
    });
  });

  describe('TokenGovernor', () => {
    it('should enforce budget plans', () => {
      const gov = new TokenGovernor();
      const plan = gov.plan({ query: 'test' });
      expect(plan.allowedDepth).toBeLessThanOrEqual(4);
      expect(plan.tokenAllocation).toBeGreaterThan(0);
    });

    it('should track metrics', () => {
      const gov = new TokenGovernor();
      gov.track(100, 50);
      const metrics = gov.getMetrics();
      expect(metrics.tokensBefore).toBe(100);
      expect(metrics.tokensAfter).toBe(50);
      expect(metrics.tokensSaved).toBe(50);
    });
  });

  describe('ProgressiveRetriever', () => {
    it('should retrieve at appropriate depths', () => {
      const gov = new TokenGovernor();
      const retriever = new ProgressiveRetriever(gov);
      
      const result = retriever.retrieve('entity1', 1);
      expect(result.depth).toBeLessThanOrEqual(1);
    });
    
    it('should get correct output from full content at depth', () => {
      const gov = new TokenGovernor();
      const retriever = new ProgressiveRetriever(gov);
      
      const full = {
        metadata: 'meta',
        microSummary: 'micro',
        designDna: 'dna',
        relevantFragments: 'frag',
        completeArtifact: 'full'
      };
      
      expect(retriever.atDepth(full, 0)).toBe('meta');
      expect(retriever.atDepth(full, 2)).toBe('dna');
      expect(retriever.atDepth(full, 4)).toBe('full');
    });
  });
});
