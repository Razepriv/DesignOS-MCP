export type RetrievalDepth = 0|1|2|3|4;
export interface ContextBudget { maxContextTokens:number; maxSources:number; maxFullArtifacts:number; maxBrowserCalls:number; preferredDepth:RetrievalDepth; }
export class TokenGovernor {
  constructor(private readonly budget: ContextBudget) {}
  plan(input:{requestedSources?:number;requestedDepth?:RetrievalDepth;requestedFullArtifacts?:number;requestedBrowserCalls?:number}={}) {
    return {
      maxContextTokens:this.budget.maxContextTokens,
      sources:Math.min(input.requestedSources ?? this.budget.maxSources,this.budget.maxSources),
      depth:Math.min(input.requestedDepth ?? this.budget.preferredDepth,this.budget.preferredDepth) as RetrievalDepth,
      fullArtifacts:Math.min(input.requestedFullArtifacts ?? 0,this.budget.maxFullArtifacts),
      browserCalls:Math.min(input.requestedBrowserCalls ?? this.budget.maxBrowserCalls,this.budget.maxBrowserCalls)
    };
  }
}
export class ExactCache<T> { private data=new Map<string,T>(); get(k:string){return this.data.get(k)} set(k:string,v:T){this.data.set(k,v)} has(k:string){return this.data.has(k)} }
export function cosineSimilarity(a:number[],b:number[]) {
  if(a.length!==b.length||a.length===0)return 0; let dot=0,aa=0,bb=0;
  for(let i=0;i<a.length;i++){dot+=a[i]!*b[i]!;aa+=a[i]!*a[i]!;bb+=b[i]!*b[i]!}
  return aa&&bb?dot/(Math.sqrt(aa)*Math.sqrt(bb)):0;
}
export interface SemanticEntry<T>{key:string;vector:number[];value:T;createdAt:number}
export class SemanticCache<T> {
  private entries:SemanticEntry<T>[]=[];
  constructor(private threshold=0.92){}
  set(key:string,vector:number[],value:T){this.entries.push({key,vector,value,createdAt:Date.now()})}
  find(vector:number[]):{entry:SemanticEntry<T>;similarity:number}|null{
    let best:{entry:SemanticEntry<T>;similarity:number}|null=null;
    for(const entry of this.entries){const similarity=cosineSimilarity(vector,entry.vector);if(similarity>=this.threshold&&(!best||similarity>best.similarity))best={entry,similarity};}
    return best;
  }
}
export interface CavemanAdapter {
  compress(input:string,contentType?:string):Promise<{compressed:string;recoveryHandle:string;tokensBefore?:number;tokensAfter?:number;ratio?:number}>;
  retrieve(recoveryHandle:string,query?:string):Promise<string>;
}
export const DEFAULT_CONTEXT_BUDGET:ContextBudget={
  maxContextTokens:Number(process.env.DESIGNOS_MAX_CONTEXT_TOKENS??12000),
  maxSources:Number(process.env.DESIGNOS_MAX_SOURCES??12),
  maxFullArtifacts:2,maxBrowserCalls:8,preferredDepth:2
};
