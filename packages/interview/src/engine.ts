import { InterviewDomain, DomainState, InterviewQuestion, InterviewAnswer, InterviewState, InterviewSummary } from './domains';
import { QUESTION_BANK } from './question-bank';
import { AnswerAnalyzer } from './analyzer';

export class InterviewEngine {
  private domains: Map<InterviewDomain, DomainState>;
  private answers: InterviewAnswer[];
  private maxQuestions: number;
  private analyzer: AnswerAnalyzer;
  
  constructor(projectContext?: any) {
    this.domains = new Map();
    this.answers = [];
    this.maxQuestions = 15;
    this.analyzer = new AnswerAnalyzer();
    this.initializeDomains(projectContext);
  }
  
  private initializeDomains(context?: any) {
    const allDomains: InterviewDomain[] = ['product', 'audience', 'objective', 'brand', 'references', 'motion', 'implementation', 'accessibility'];
    for (const d of allDomains) {
      this.domains.set(d, { uncertainty: 1.0, askedQuestions: [] });
    }
  }
  
  getNextQuestion(): InterviewQuestion | null {
    if (this.answers.length >= this.maxQuestions) return null;
    
    let highestUncertainty = 0;
    let targetDomain: InterviewDomain | null = null;
    
    for (const [domain, state] of this.domains.entries()) {
      if (state.uncertainty > highestUncertainty) {
        highestUncertainty = state.uncertainty;
        targetDomain = domain;
      }
    }
    
    if (!targetDomain || highestUncertainty < 0.2) return null;
    
    const domainQuestions = QUESTION_BANK[targetDomain];
    const state = this.domains.get(targetDomain)!;
    
    const unasked = domainQuestions.filter(q => !state.askedQuestions.includes(q.id));
    if (unasked.length === 0) {
      state.uncertainty = 0; // Forced reduction if no questions left
      return this.getNextQuestion();
    }
    
    return unasked[0];
  }
  
  processAnswer(questionId: string, answerText: string) {
    let qDomain: InterviewDomain = 'product';
    for (const [domain, questions] of Object.entries(QUESTION_BANK)) {
      if (questions.find(q => q.id === questionId)) {
        qDomain = domain as InterviewDomain;
        break;
      }
    }

    const answer: InterviewAnswer = {
      questionId,
      domain: qDomain,
      text: answerText,
      timestamp: new Date().toISOString()
    };
    
    this.answers.push(answer);
    
    const state = this.domains.get(qDomain)!;
    state.askedQuestions.push(questionId);
    
    const analysis = this.analyzer.analyze(answer);
    state.uncertainty = Math.max(0, state.uncertainty - analysis.uncertaintyReduction);
    
    this.domains.set(qDomain, state);
    
    const nextQ = this.getNextQuestion();
    
    return {
      uncertaintyReduced: { [qDomain]: analysis.uncertaintyReduction },
      followUpNeeded: state.uncertainty > 0.5,
      nextQuestion: nextQ
    };
  }
  
  getState(): InterviewState {
    const dRecord: Partial<Record<InterviewDomain, DomainState>> = {};
    for (const [k, v] of this.domains.entries()) {
      dRecord[k] = v;
    }
    return {
      domains: dRecord as Record<InterviewDomain, DomainState>,
      answers: this.answers,
      isComplete: this.getNextQuestion() === null
    };
  }
  
  getSummary(): InterviewSummary {
    const dRecord: Partial<Record<InterviewDomain, string>> = {};
    const findings: string[] = [];
    for (const [k, v] of this.domains.entries()) {
      dRecord[k] = `Uncertainty: ${v.uncertainty}`;
      findings.push(`${k} processed.`);
    }
    return {
      domains: dRecord as Record<InterviewDomain, string>,
      keyFindings: findings
    };
  }
  
  getDomainUncertainty(): Record<InterviewDomain, number> {
    const dRecord: Partial<Record<InterviewDomain, number>> = {};
    for (const [k, v] of this.domains.entries()) {
      dRecord[k] = v.uncertainty;
    }
    return dRecord as Record<InterviewDomain, number>;
  }
}
