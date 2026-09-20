export interface CaptureRequest {url:string;screenshot?:boolean;recording?:boolean;html?:boolean;elements?:boolean}
export interface CaptureArtifact {url:string;screenshotPath?:string;recordingPath?:string;html?:string;metadata?:Record<string,unknown>}
export interface BrowserResearchAdapter {capture(request:CaptureRequest):Promise<CaptureArtifact>;inspect(url:string):Promise<Record<string,unknown>>}
export const BROWSER_STACK={external:"TinyFish",deterministic:"Playwright"} as const;
