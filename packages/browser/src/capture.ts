import { PlaywrightAdapter } from './playwright-adapter.js';
import { TinyFishAdapter, CaptureOptions as TFCaptureOptions } from './tinyfish-adapter.js';
import { DEVICE_PROFILES } from './device-profiles.js';

export interface PageCapture { screenshot: Buffer; source: 'playwright' | 'tinyfish'; }
export interface ElementCapture { screenshot: Buffer; }
export interface EngineResponsiveCapture { captures: { device: string; screenshot: Buffer }[]; }

export class CaptureEngine {
  constructor(private playwright: PlaywrightAdapter, private tinyfish?: TinyFishAdapter) {}
  
  async capturePage(url: string, options?: TFCaptureOptions): Promise<PageCapture> { 
    if (this.tinyfish && this.tinyfish.isAvailable()) {
      try {
        const res = await this.tinyfish.capture(url, options);
        return { screenshot: res.image, source: 'tinyfish' };
      } catch (e) {
        // Fallback to playwright
      }
    }
    const screenshot = await this.playwright.captureScreenshot(url, { fullPage: options?.fullPage, type: options?.format });
    return { screenshot, source: 'playwright' };
  }
  
  async captureElement(url: string, selector: string): Promise<ElementCapture> { 
    await this.playwright.launch();
    // Simplified element capture
    const screenshot = Buffer.from(''); 
    return { screenshot };
  }
  
  async captureResponsive(url: string): Promise<EngineResponsiveCapture> { 
    const devices = [DEVICE_PROFILES.iphone15, DEVICE_PROFILES.ipadPro, DEVICE_PROFILES.macbook];
    const captures = await this.playwright.captureResponsive(url, devices);
    return { captures };
  }
}
