/** Full DesignDNA interface per spec §19 — every reference normalizes into this. */
export interface DesignDNA {
  id: string;
  sourceId?: string;
  referenceUrl?: string;

  // Visual style
  style: string[];
  emotionalTone: string[];

  // Layout & composition
  composition: string;
  grid: string;
  hierarchy: string;
  spacing: { system: string; density: 'compact' | 'comfortable' | 'spacious' };
  density: 'compact' | 'comfortable' | 'spacious';

  // Typography
  typography: {
    families: string[];
    scale: string;
    lineHeight: string;
    tracking: string;
    weights: number[];
  };
  typeScale: string;
  lineHeight: string;
  tracking: string;

  // Color
  palette: PaletteEntry[];
  colorRatios: Record<string, number>;

  // Visual elements
  imagery: string;
  illustration: string;
  radius: string;
  border: string;
  shadow: string;

  // Navigation & patterns
  navigation: string;
  componentPatterns: string[];

  // Interaction
  interactions: string[];
  hover: string;
  cursor: string;

  // Motion
  motion: {
    style: string;
    intensity: 'minimal' | 'moderate' | 'cinematic';
    timing: string;
    easing: string;
  };
  timing: string;
  easing: string;
  scrollBehavior: string;

  // Responsive
  responsiveBehavior: string;
  reducedMotionBehavior: string;

  // Technical
  technologies: string[];
  dependencies: string[];
  performanceObservations: string[];

  // Extracted principles
  reusablePrinciples: string[];
  confidence: number;
}

export interface PaletteEntry {
  hex: string;
  role: string;
  weight?: number;
}

/** Create a default/empty DesignDNA. */
export function createEmptyDesignDNA(id: string): DesignDNA {
  return {
    id,
    style: [],
    emotionalTone: [],
    composition: '',
    grid: '',
    hierarchy: '',
    spacing: { system: '', density: 'comfortable' },
    density: 'comfortable',
    typography: { families: [], scale: '', lineHeight: '', tracking: '', weights: [] },
    typeScale: '',
    lineHeight: '',
    tracking: '',
    palette: [],
    colorRatios: {},
    imagery: '',
    illustration: '',
    radius: '',
    border: '',
    shadow: '',
    navigation: '',
    componentPatterns: [],
    interactions: [],
    hover: '',
    cursor: '',
    motion: { style: '', intensity: 'minimal', timing: '', easing: '' },
    timing: '',
    easing: '',
    scrollBehavior: '',
    responsiveBehavior: '',
    reducedMotionBehavior: '',
    technologies: [],
    dependencies: [],
    performanceObservations: [],
    reusablePrinciples: [],
    confidence: 0,
  };
}
