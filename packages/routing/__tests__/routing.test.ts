import { describe, it, expect } from 'vitest';
import { Router } from '../src/router';
import { DesignSource } from '../src/ranking';

const SOURCES: DesignSource[] = [
  { id: '1', name: 'Godly', categories: ['cinematic', '3D', 'animation'], priority: 5, lastUpdated: '2023' },
  { id: '2', name: 'Awwwards', categories: ['3D', 'creative'], priority: 4, lastUpdated: '2023' },
  { id: '3', name: 'Mobbin', categories: ['enterprise', 'saas', 'dashboard'], priority: 5, lastUpdated: '2023' },
  { id: '4', name: 'SaaSFrame', categories: ['saas', 'marketing'], priority: 3, lastUpdated: '2023' }
];

describe('Router', () => {
  it('should select cinematic 3D SaaS hero', () => {
    const router = new Router();
    const result = router.route('cinematic 3D SaaS hero', SOURCES);
    const names = result.sources.map(s => s.name);
    expect(names).toContain('Godly');
    expect(names).toContain('Awwwards');
  });

  it('should select enterprise admin dashboard', () => {
    const router = new Router();
    const result = router.route('enterprise admin dashboard', SOURCES);
    const names = result.sources.map(s => s.name);
    expect(names).toContain('Mobbin');
    expect(result.sources[0].name).toBe('Mobbin');
  });
});
