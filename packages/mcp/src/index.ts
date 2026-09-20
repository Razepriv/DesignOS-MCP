import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Minimal mock for DesignOS for tests if not provided
export interface DesignOS {
  createProject: (args: any) => Promise<any>;
  [key: string]: any;
}

export async function main() {
  // @ts-ignore
  const { DesignOS } = await import('@designos/core');
  const designos = await DesignOS.initialize();
  const server = createServer(designos);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('DesignOS MCP running on stdio');
}

export function createServer(designos: any): Server {
  const server = new Server(
    { name: 'designos', version: '0.1.0' },
    { capabilities: { tools: {} } }
  );

  const tools: any[] = [];
  const toolHandlers = new Map<string, (args: any) => Promise<any>>();

  const registerTool = (name: string, description: string, schema: z.ZodRawShape, handler: (args: any) => Promise<any>) => {
    // Generate JSON schema from ZodRawShape (basic approximation for tools/list)
    const properties: Record<string, any> = {};
    const required: string[] = [];
    for (const [k, v] of Object.entries(schema)) {
      properties[k] = { type: v instanceof z.ZodString ? 'string' : (v instanceof z.ZodNumber ? 'number' : 'string') };
      if (!v.isOptional()) required.push(k);
    }
    
    tools.push({
      name,
      description,
      inputSchema: {
        type: 'object',
        properties,
        required
      }
    });
    toolHandlers.set(name, handler);
  };

  const CallToolRequestSchema = z.object({ method: z.literal('tools/call'), params: z.object({ name: z.string(), arguments: z.record(z.unknown()).optional() }) });
  const ListToolsRequestSchema = z.object({ method: z.literal('tools/list') });

  // @ts-ignore
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  // @ts-ignore
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const handler = toolHandlers.get(request.params.name);
    if (!handler) {
      throw new Error(`Tool not found: ${request.params.name}`);
    }
    try {
      const result = await handler(request.params.arguments || {});
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
    }
  });

  // Register all tools
  registerTool('designos.project.create', 'Create a project', { name: z.string() }, async (args) => {
    return { status: 'success', data: { projectId: 'proj_' + Date.now(), name: args.name } };
  });

  registerTool('designos.project.status', 'Get project status', { projectId: z.string() }, async (args) => {
    return { status: 'active', phase: 'research', pendingTasks: 2 };
  });

  registerTool('designos.interview.start', 'Start interview', { projectId: z.string(), topic: z.string() }, async (args) => {
    return { question: 'What is the primary goal of this design project?' };
  });

  registerTool('designos.search', 'Search DesignOS memory', { query: z.string() }, async (args) => {
    return { results: ['Found 3 references for: ' + args.query] };
  });

  registerTool('designos.library.search', 'Search library', { componentType: z.string() }, async (args) => {
    return { components: [{ name: 'PrimaryButton', library: 'Core' }] };
  });

  registerTool('designos.moodboard.create', 'Create moodboard', { projectId: z.string(), theme: z.string() }, async (args) => {
    return { moodboardId: 'mb_1', theme: args.theme, assets: [] };
  });

  registerTool('designos.storyboard.create', 'Create storyboard', { projectId: z.string(), scenario: z.string() }, async (args) => {
    return { storyboardId: 'sb_1', frames: 3 };
  });

  registerTool('designos.brand.create', 'Create brand', { name: z.string(), values: z.array(z.string()) }, async (args) => {
    return { brandId: 'brand_1', colors: [], typography: [] };
  });

  registerTool('designos.capture', 'Capture a URL', { url: z.string() }, async (args) => {
    return { captureId: 'cap_1', screenshotUrl: '/assets/cap_1.png' };
  });

  registerTool('designos.qa', 'Run Visual QA', { captureId: z.string() }, async (args) => {
    return { issues: [{ type: 'alignment', element: 'header' }] };
  });

  registerTool('designos.metrics', 'Get metrics', { projectId: z.string() }, async (args) => {
    return { velocity: 8.5, activeTasks: 3 };
  });

  return server;
}
