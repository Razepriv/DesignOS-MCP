export interface AgentRuntimeAdapter {
  execute(task: string): Promise<void>;
}
