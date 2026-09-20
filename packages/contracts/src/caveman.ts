export interface CavemanAdapter {
  run(command: string): Promise<string>;
}
