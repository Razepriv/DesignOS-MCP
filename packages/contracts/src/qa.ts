export interface QAFinding {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'fixed' | 'ignored';
}

export interface QARun {
  id: string;
  timestamp: string;
  findings: QAFinding[];
  passed: boolean;
}
