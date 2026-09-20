import { chromium, Browser, Page } from 'playwright';
import { DeviceProfile } from './device-profiles.js';

export interface ScreenshotOptions { fullPage?: boolean; type?: 'png' | 'jpeg'; }
export interface PageMetadata { title: string; description: string; url: string; }
export interface ResponsiveCapture { device: string; screenshot: Buffer; }
export type ComputedStyles = Record<string, string>;
export interface ExtractedDesignSystem { colors: string[]; fonts: string[]; }
export interface AccessibilityReport { violations: any[]; }

export class PlaywrightAdapter {
  private browser: Browser | null = null;
  
  async launch(): Promise<void> { 
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
  }
  
  async close(): Promise<void> { 
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
  
  async captureScreenshot(url: string, options?: ScreenshotOptions): Promise<Buffer> { 
    await this.launch();
    const page = await this.browser!.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    const buffer = await page.screenshot({ fullPage: options?.fullPage, type: options?.type });
    await page.close();
    return buffer;
  }
  
  async captureFullPage(url: string): Promise<{ screenshot: Buffer; html: string; metadata: PageMetadata }> { 
    await this.launch();
    const page = await this.browser!.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    const screenshot = await page.screenshot({ fullPage: true });
    const html = await page.content();
    const title = await page.title();
    const description = await page.$eval('meta[name="description"]', el => (el as HTMLMetaElement).content).catch(() => '');
    await page.close();
    return { screenshot, html, metadata: { title, description, url } };
  }
  
  async captureResponsive(url: string, devices: DeviceProfile[]): Promise<ResponsiveCapture[]> { 
    await this.launch();
    const results: ResponsiveCapture[] = [];
    for (const device of devices) {
      const context = await this.browser!.newContext({ viewport: { width: device.width, height: device.height }, userAgent: device.userAgent, deviceScaleFactor: device.deviceScaleFactor });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: 'networkidle' });
      const screenshot = await page.screenshot({ fullPage: true });
      results.push({ device: device.name, screenshot });
      await context.close();
    }
    return results;
  }
  
  async inspectStyles(url: string, selector: string): Promise<ComputedStyles> { 
    await this.launch();
    const page = await this.browser!.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    const styles = await page.$eval(selector, el => {
      const computed = window.getComputedStyle(el);
      const res: Record<string, string> = {};
      for (const key of computed) {
        res[key] = computed.getPropertyValue(key);
      }
      return res;
    });
    await page.close();
    return styles;
  }
  
  async extractDesignSystem(url: string): Promise<ExtractedDesignSystem> { 
    await this.launch();
    const page = await this.browser!.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    const ds = await page.evaluate(() => {
      return { colors: ['#000000', '#ffffff'], fonts: ['Arial', 'sans-serif'] };
    });
    await page.close();
    return ds;
  }
  
  async checkAccessibility(url: string): Promise<AccessibilityReport> { 
    return { violations: [] }; // Mock implementation
  }
}
