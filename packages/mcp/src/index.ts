import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { JsonProjectStore } from "@designos/core";
import { DEFAULT_CONTEXT_BUDGET, TokenGovernor } from "@designos/optimization";
import { CORE_SOURCES, planSources } from "@designos/source-registry";

const store=new JsonProjectStore();
const jsonResult=(value:unknown)=>({content:[{type:"text" as const,text:JSON.stringify(value,null,2)}],structuredContent:value as Record<string,unknown>});

function createServer():McpServer{
 const server=new McpServer({name:"designos",version:"0.1.0"},{instructions:"Understand requirements first. Search DesignOS memory before external sources. Moodboard approval precedes storyboard; storyboard approval precedes implementation. Prefer Design DNA and progressive retrieval over raw source dumps."});
 server.registerTool("designos.project.create",{description:"Create a persistent DesignOS project session.",inputSchema:z.object({title:z.string().min(1),inputType:z.enum(["prd","prompt","url","screenshot","existing_product"]),brief:z.string().min(1),maxContextTokens:z.number().int().positive().optional(),maxSources:z.number().int().min(1).max(50).optional()})},async input=>jsonResult(await store.create(input)));
 server.registerTool("designos.project.status",{description:"Read persistent DesignOS project state.",inputSchema:z.object({projectId:z.string().uuid()})},async({projectId})=>{const p=await store.get(projectId);return p?jsonResult(p):{content:[{type:"text",text:`Project not found: ${projectId}`}],isError:true}});
 server.registerTool("designos.research.plan",{description:"Route a design query to relevant registered sources without searching every source.",inputSchema:z.object({query:z.string().min(1),maxSources:z.number().int().min(1).max(30).optional()})},async({query,maxSources})=>jsonResult(planSources(query,maxSources??DEFAULT_CONTEXT_BUDGET.maxSources)));
 server.registerTool("designos.context.plan",{description:"Apply token/context budgets before retrieval.",inputSchema:z.object({maxContextTokens:z.number().int().positive().optional(),maxSources:z.number().int().positive().optional(),requestedSources:z.number().int().positive().optional(),requestedDepth:z.union([z.literal(0),z.literal(1),z.literal(2),z.literal(3),z.literal(4)]).optional(),requestedFullArtifacts:z.number().int().nonnegative().optional(),requestedBrowserCalls:z.number().int().nonnegative().optional()})},async input=>{const g=new TokenGovernor({...DEFAULT_CONTEXT_BUDGET,maxContextTokens:input.maxContextTokens??DEFAULT_CONTEXT_BUDGET.maxContextTokens,maxSources:input.maxSources??DEFAULT_CONTEXT_BUDGET.maxSources});return jsonResult(g.plan(input));});
 server.registerTool("designos.sources.summary",{description:"Summarize the seeded source registry.",inputSchema:z.object({})},async()=>jsonResult({count:CORE_SOURCES.length,sources:CORE_SOURCES.map(({id,name,url,categories,adapter,access})=>({id,name,url,categories,adapter,access}))}));
 return server;
}
void serveStdio(createServer);
console.error("DesignOS MCP running on stdio");
