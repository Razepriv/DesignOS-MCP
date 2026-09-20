import { randomUUID } from 'node:crypto';

export interface VideoScene {
  id: string;
  startTime: number;
  duration: number;
  intent: string;
  motionNotes: string;
  transition: string;
  assets: string[];
  text?: string;
  animation?: string;
}

export interface VideoProductionSpec {
  id: string;
  projectId: string;
  purpose: 'app-preview' | 'product-demo' | 'launch' | 'social' | 'feature-demo';
  durationSeconds: number;
  width: number;
  height: number;
  fps: number;
  scenes: VideoScene[];
  soundtrack?: string;
  brandTokens?: Record<string, string>;
  createdAt: string;
}

export class VideoSpecBuilder {
  private spec: Partial<VideoProductionSpec>;
  
  constructor(projectId: string, purpose: VideoProductionSpec['purpose']) {
    this.spec = {
      id: randomUUID(),
      projectId,
      purpose,
      durationSeconds: 30,
      width: 1920,
      height: 1080,
      fps: 30,
      scenes: [],
      createdAt: new Date().toISOString(),
    };
  }
  
  setDuration(seconds: number): this { 
    this.spec.durationSeconds = seconds;
    return this;
  }
  
  setResolution(width: number, height: number): this { 
    this.spec.width = width;
    this.spec.height = height;
    return this;
  }
  
  addScene(scene: Omit<VideoScene, 'id'>): this { 
    this.spec.scenes = this.spec.scenes || [];
    this.spec.scenes.push({ ...scene, id: randomUUID() });
    return this;
  }
  
  setBrandTokens(tokens: Record<string, string>): this { 
    this.spec.brandTokens = { ...tokens };
    return this;
  }
  
  build(): VideoProductionSpec { 
    return this.spec as VideoProductionSpec;
  }
  
  static appPreview(projectId: string, screenshots: string[]): VideoProductionSpec {
    const builder = new VideoSpecBuilder(projectId, 'app-preview');
    builder.setDuration(30).setResolution(1080, 1920);
    builder.addScene({ startTime: 0, duration: 2, intent: 'hook', motionNotes: 'fast', transition: 'cut', assets: [] });
    builder.addScene({ startTime: 2, duration: 4, intent: 'product reveal', motionNotes: 'smooth', transition: 'fade', assets: screenshots.slice(0, 1) });
    builder.addScene({ startTime: 6, duration: 5, intent: 'workflow', motionNotes: 'dynamic', transition: 'slide', assets: screenshots.slice(1, 2) });
    builder.addScene({ startTime: 11, duration: 5, intent: 'feature', motionNotes: 'zoom', transition: 'wipe', assets: screenshots.slice(2, 3) });
    builder.addScene({ startTime: 16, duration: 5, intent: 'differentiator', motionNotes: 'pan', transition: 'fade', assets: screenshots.slice(3, 4) });
    builder.addScene({ startTime: 21, duration: 5, intent: 'personalization', motionNotes: 'slow', transition: 'dissolve', assets: screenshots.slice(4, 5) });
    builder.addScene({ startTime: 26, duration: 4, intent: 'brand+CTA', motionNotes: 'static', transition: 'none', assets: [] });
    return builder.build();
  }
  
  static socialClip(projectId: string, screenshots: string[]): VideoProductionSpec {
    const builder = new VideoSpecBuilder(projectId, 'social');
    builder.setDuration(15).setResolution(1080, 1920);
    builder.addScene({ startTime: 0, duration: 3, intent: 'hook', motionNotes: 'jump', transition: 'cut', assets: screenshots.slice(0, 1) });
    builder.addScene({ startTime: 3, duration: 10, intent: 'content', motionNotes: 'flow', transition: 'fade', assets: screenshots.slice(1, 3) });
    builder.addScene({ startTime: 13, duration: 2, intent: 'cta', motionNotes: 'pop', transition: 'none', assets: [] });
    return builder.build();
  }
}
