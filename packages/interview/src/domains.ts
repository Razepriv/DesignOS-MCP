export type InterviewDomain = 'product' | 'audience' | 'objective' | 'brand' | 'references' | 'motion' | 'implementation' | 'accessibility';

export interface DomainState {
  uncertainty: number; // 0 to 1
  askedQuestions: string[];
}

export interface InterviewQuestion {
  id: string;
  domain: InterviewDomain;
  text: string;
}

export interface InterviewAnswer {
  questionId: string;
  domain: InterviewDomain;
  text: string;
  timestamp: string;
}

export interface InterviewState {
  domains: Record<InterviewDomain, DomainState>;
  answers: InterviewAnswer[];
  isComplete: boolean;
}

export interface InterviewSummary {
  domains: Record<InterviewDomain, string>;
  keyFindings: string[];
}
