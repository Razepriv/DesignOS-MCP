import { describe, it, expect } from 'vitest';
import { InterviewEngine } from '../src/engine';

describe('InterviewEngine', () => {
  it('should initialize and get next question', () => {
    const engine = new InterviewEngine();
    const q = engine.getNextQuestion();
    expect(q).not.toBeNull();
  });

  it('should reduce uncertainty when answer is processed', () => {
    const engine = new InterviewEngine();
    const q = engine.getNextQuestion();
    const res = engine.processAnswer(q!.id, 'This is a very long and detailed answer that should reduce uncertainty significantly.');
    
    const uncert = engine.getDomainUncertainty();
    expect(uncert[q!.domain]).toBeLessThan(1.0);
  });
});
