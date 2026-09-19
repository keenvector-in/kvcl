/** Wire shape of a workflow graph — the same JSON edge-gateway's /api/workflows returns and accepts. */
export interface WorkflowNode {
  id: string;
  /** A type id from workflowNodeCatalog. */
  type: string;
  label: string;
  position: { x: number; y: number };
  config: Record<string, string>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  /** "yes" or "no" from a branching node, "" otherwise. */
  source_handle: string;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
