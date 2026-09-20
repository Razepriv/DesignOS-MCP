import { InterviewDomain, InterviewQuestion } from './domains';

export const QUESTION_BANK: Record<InterviewDomain, InterviewQuestion[]> = {
  product: [
    { id: 'p1', domain: 'product', text: 'What exactly are we building and what is its primary category?' },
    { id: 'p2', domain: 'product', text: 'What is the core value proposition and business model?' },
  ],
  audience: [
    { id: 'a1', domain: 'audience', text: 'Who is the primary audience (B2B, B2C, specific personas)?' },
    { id: 'a2', domain: 'audience', text: 'What is the technical sophistication of your users?' },
  ],
  objective: [
    { id: 'o1', domain: 'objective', text: 'What is the primary action you want users to take?' },
  ],
  brand: [
    { id: 'b1', domain: 'brand', text: 'How would you describe your brand personality?' },
    { id: 'b2', domain: 'brand', text: 'Do you have existing brand colors or typography to adhere to?' },
  ],
  references: [
    { id: 'r1', domain: 'references', text: 'Can you share examples of products you admire and what you like about them?' },
  ],
  motion: [
    { id: 'm1', domain: 'motion', text: 'How much animation and motion do you envision?' },
  ],
  implementation: [
    { id: 'i1', domain: 'implementation', text: 'What frameworks or technical constraints exist?' },
  ],
  accessibility: [
    { id: 'c1', domain: 'accessibility', text: 'What are your accessibility requirements (e.g., WCAG level)?' },
  ]
};
