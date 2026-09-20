#!/usr/bin/env node
import { DesignOS } from '@designos/core';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  const designos = await DesignOS.initialize();
  
  switch (command) {
    case 'project': await handleProject(designos, args.slice(1)); break;
    case 'interview': await handleInterview(designos, args.slice(1)); break;
    case 'research': await handleResearch(designos, args.slice(1)); break;
    case 'sources': await handleSources(args.slice(1)); break;
    case 'moodboard': await handleMoodboard(designos, args.slice(1)); break;
    case 'storyboard': await handleStoryboard(designos, args.slice(1)); break;
    case 'brand': await handleBrand(designos, args.slice(1)); break;
    case 'qa': await handleQA(designos, args.slice(1)); break;
    case 'critique': await handleCritique(designos, args.slice(1)); break;
    case 'production': await handleProduction(designos, args.slice(1)); break;
    case 'export': await handleExport(designos, args.slice(1)); break;
    case 'metrics': await handleMetrics(designos, args.slice(1)); break;
    case 'version': console.log('DesignOS v0.1.0'); break;
    case 'help': case undefined: printHelp(); break;
    default: console.error(`Unknown command: ${command}`); printHelp(); process.exitCode = 1;
  }
  
  await designos.shutdown();
}

async function handleProject(designos: any, args: string[]) {
  const sub = args[0];
  switch (sub) {
    case 'create': {
      const title = args[1] ?? 'Untitled Project';
      const project = designos.projects.create({ title, inputType: 'prompt', originalInput: title, brief: title });
      console.log(`Created project: ${project.id}`);
      console.log(`  Title: ${project.title}`);
      console.log(`  Stage: ${project.currentStage}`);
      break;
    }
    case 'list': {
      const projects = designos.projects.list();
      if (projects.length === 0) { console.log('No projects yet.'); return; }
      for (const p of projects) console.log(`  ${p.id.slice(0,8)} | ${p.currentStage.padEnd(20)} | ${p.title}`);
      break;
    }
    case 'status': {
      const project = designos.projects.get(args[1]!);
      if (!project) { console.error('Project not found'); process.exitCode = 1; return; }
      console.log(JSON.stringify(project, null, 2));
      break;
    }
    case 'resume': {
      const project = designos.projects.resume(args[1]!);
      console.log(`Resumed project: ${project.title} at stage ${project.currentStage}`);
      break;
    }
    default: console.log('Usage: designos project <create|list|status|resume> [args]');
  }
}

async function handleSources(args: string[]) {
  const { SourceRegistry } = await import('@designos/source-registry');
  const registry = new SourceRegistry();
  const sub = args[0];
  switch (sub) {
    case 'stats': {
      const stats = registry.getStats();
      console.log(`Sources: ${stats.total}`);
      console.log(`Deep adapters: ${stats.byAdapter['deep'] ?? 0}`);
      console.log(`Structured adapters: ${stats.byAdapter['structured-browser'] ?? 0}`);
      console.log(`Generic adapters: ${stats.byAdapter['generic-reference'] ?? 0}`);
      break;
    }
    case 'search': {
      const results = registry.search(args.slice(1).join(' '));
      for (const s of results.slice(0, 20)) console.log(`  ${s.id}: ${s.name} (${s.category})`);
      break;
    }
    default: console.log('Usage: designos sources <stats|search> [query]');
  }
}

async function handleInterview(d: any, args: string[]) { console.log('Usage: designos interview <start|answer> [projectId]'); }
async function handleResearch(d: any, args: string[]) { console.log('Usage: designos research <query> [options]'); }
async function handleMoodboard(d: any, args: string[]) { console.log('Usage: designos moodboard <create|approve> [projectId]'); }
async function handleStoryboard(d: any, args: string[]) { console.log('Usage: designos storyboard <create|approve> [projectId]'); }
async function handleBrand(d: any, args: string[]) { console.log('Usage: designos brand <create|export> [projectId]'); }
async function handleQA(d: any, args: string[]) { console.log('Usage: designos qa <run> [projectId]'); }
async function handleCritique(d: any, args: string[]) { console.log('Usage: designos critique <run> [projectId]'); }
async function handleProduction(d: any, args: string[]) { console.log('Usage: designos production <mockups|store|video|launch|prompts|export> [projectId]'); }
async function handleExport(d: any, args: string[]) { console.log('Usage: designos export [projectId]'); }
async function handleMetrics(d: any, args: string[]) { console.log('Usage: designos metrics [projectId]'); }

function printHelp() {
  console.log(`
DesignOS v0.1.0 — Design Intelligence Operating System

Usage: designos <command> [options]

Commands:
  project      Manage projects (create, list, status, resume)
  interview    Adaptive interview (start, answer)
  research     Design research (query, visual_search)
  sources      Source registry (stats, search)
  moodboard    Moodboard management (create, approve)
  storyboard   Storyboard management (create, approve)
  brand        Brand system (create, export)
  qa           Visual QA (run)
  critique     Critique council (run)
  production   Production studio (mockups, store, video, launch, prompts)
  export       Export package
  metrics      Token/cache metrics
  version      Show version
  help         Show this help
`);
}

main().catch(err => { console.error(err); process.exitCode = 1; });
