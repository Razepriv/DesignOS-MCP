export interface AgentRuntimeAdapter {
  detect(): Promise<boolean>;
  version(): Promise<string>;
  capabilities(): string[];
  start(workdir: string): Promise<void>;
  sendPrompt(prompt: string): Promise<string>;
  streamEvents(callback: (event: any) => void): void;
  cancel(): Promise<void>;
}
