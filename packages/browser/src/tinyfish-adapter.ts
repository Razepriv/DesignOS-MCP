export interface SearchResult { title: string; url: string; snippet: string; }
export interface FetchResult { url: string; content: string; status: number; }
export interface InspectResult { url: string; metadata: any; }
export interface CaptureOptions { fullPage?: boolean; format?: 'png' | 'jpeg'; }
export interface CaptureResult { url: string; image: Buffer; }
export interface AutomationStep { action: string; target?: string; value?: string; }
export interface AutomationResult { success: boolean; data?: any; }

export class TinyFishAdapter {
  private apiKey: string | null;
  constructor(apiKey?: string) { 
    this.apiKey = apiKey ?? process.env.TINYFISH_API_KEY ?? null; 
  }
  
  isAvailable(): boolean { 
    return this.apiKey !== null; 
  }
  
  private checkKey() {
    if (!this.apiKey) throw new Error("TINYFISH_API_KEY required");
  }

  async search(query: string, options?: { maxResults?: number }): Promise<SearchResult[]> { 
    this.checkKey();
    return [{ title: 'Mock', url: 'https://mock.com', snippet: query }];
  }
  
  async fetch(url: string): Promise<FetchResult> { 
    this.checkKey();
    return { url, content: '<html><body>Mock</body></html>', status: 200 };
  }
  
  async inspect(url: string): Promise<InspectResult> { 
    this.checkKey();
    return { url, metadata: { title: 'Mock' } };
  }
  
  async capture(url: string, options?: CaptureOptions): Promise<CaptureResult> { 
    this.checkKey();
    return { url, image: Buffer.from('') };
  }
  
  async runAutomation(url: string, steps: AutomationStep[]): Promise<AutomationResult> { 
    this.checkKey();
    return { success: true, data: { stepsRun: steps.length } };
  }
}
