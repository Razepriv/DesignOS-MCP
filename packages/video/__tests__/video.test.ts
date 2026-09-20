import { describe, it, expect } from 'vitest';
import { VideoSpecBuilder, VideoRenderer } from '../src/index.js';

describe('Video package', () => {
  it('builds app preview spec', () => {
    const spec = VideoSpecBuilder.appPreview('proj-1', ['s1.png', 's2.png', 's3.png']);
    expect(spec.durationSeconds).toBe(30);
    expect(spec.scenes.length).toBe(7);
  });

  it('renderer returns fallback or remotion', async () => {
    const renderer = new VideoRenderer();
    const spec = VideoSpecBuilder.socialClip('proj-2', []);
    const result = await renderer.renderSpec(spec, '/tmp');
    expect(result.success).toBe(true);
  });
});
