export interface CaptureRequest {
  url: string;
  selector?: string;
}

export interface CaptureArtifact {
  screenshotUrl: string;
  domSnapshot: string;
}

export interface BrowserAdapter {
  capture(req: CaptureRequest): Promise<CaptureArtifact>;
}
