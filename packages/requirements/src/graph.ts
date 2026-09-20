import { randomUUID } from 'crypto';

export interface RequirementNode {
  id: string;
  reason: string;
  confidence: number;
  designImpact: string;
  technicalImpact: string;
  source: string;
}

export interface RequirementRelation {
  id: string;
  fromId: string;
  toId: string;
  type: string;
}

export class RequirementsGraph {
  private nodes: Map<string, RequirementNode> = new Map();
  private edges: RequirementRelation[] = [];

  addRequirement(req: Omit<RequirementNode, 'id'>): string {
    const id = randomUUID();
    this.nodes.set(id, { id, ...req });
    return id;
  }

  addRelation(fromId: string, toId: string, type: string) {
    if (!this.nodes.has(fromId) || !this.nodes.has(toId)) {
      throw new Error('Node not found');
    }
    const id = randomUUID();
    this.edges.push({ id, fromId, toId, type });
  }

  getDesignConsequences(): string[] {
    return Array.from(this.nodes.values()).map(n => n.designImpact).filter(Boolean);
  }

  getTechnicalConsequences(): string[] {
    return Array.from(this.nodes.values()).map(n => n.technicalImpact).filter(Boolean);
  }

  toJSON() {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges
    };
  }

  fromJSON(data: any) {
    this.nodes.clear();
    this.edges = data.edges || [];
    for (const node of (data.nodes || [])) {
      this.nodes.set(node.id, node);
    }
  }
}
