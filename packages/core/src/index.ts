import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const PROJECT_STAGES = ["new","discovery","research","moodboard_pending","moodboard_approved","storyboard_pending","storyboard_approved","design_spec_ready","implementing","qa","design_approved","production","ready_to_ship"] as const;
export type ProjectStage = (typeof PROJECT_STAGES)[number];
export type InputType = "prd" | "prompt" | "url" | "screenshot" | "existing_product";

export interface ProjectSession {
  id: string;
  title: string;
  inputType: InputType;
  brief: string;
  currentStage: ProjectStage;
  createdAt: string;
  updatedAt: string;
  decisions: Array<{id:string;kind:"keep"|"modify"|"reject"|"constraint"|"preference";subject:string;note?:string;createdAt:string}>;
  approvals: Array<{id:string;artifactType:"moodboard"|"storyboard"|"design"|"production";artifactId:string;approvedAt:string}>;
  artifacts: Array<{id:string;type:string;uri:string;source?:string;createdAt:string}>;
  tokenBudget: { maxContextTokens: number; maxSources: number };
}

export interface CreateProjectInput {
  title: string;
  inputType: InputType;
  brief: string;
  maxContextTokens?: number;
  maxSources?: number;
}

export function newProject(input: CreateProjectInput): ProjectSession {
  const now = new Date().toISOString();
  return {
    id: randomUUID(), title: input.title, inputType: input.inputType, brief: input.brief,
    currentStage: "new", createdAt: now, updatedAt: now, decisions: [], approvals: [], artifacts: [],
    tokenBudget: { maxContextTokens: input.maxContextTokens ?? 12000, maxSources: input.maxSources ?? 12 }
  };
}

export class JsonProjectStore {
  private readonly projectsDir: string;
  constructor(home = process.env.DESIGNOS_HOME ?? ".designos") { this.projectsDir = path.join(home, "projects"); }
  async init() { await mkdir(this.projectsDir, { recursive: true }); }
  private file(id: string) { return path.join(this.projectsDir, `${id}.json`); }
  async create(input: CreateProjectInput) { await this.init(); const p = newProject(input); return this.save(p); }
  async get(id: string): Promise<ProjectSession | null> {
    await this.init();
    try { return JSON.parse(await readFile(this.file(id), "utf8")) as ProjectSession; }
    catch (e) { if ((e as NodeJS.ErrnoException).code === "ENOENT") return null; throw e; }
  }
  async save(project: ProjectSession) {
    await this.init();
    const next = { ...project, updatedAt: new Date().toISOString() };
    await writeFile(this.file(project.id), JSON.stringify(next, null, 2), "utf8");
    return next;
  }
  async transition(id: string, stage: ProjectStage) {
    const p = await this.get(id); if (!p) throw new Error(`Project not found: ${id}`);
    return this.save({ ...p, currentStage: stage });
  }
}
