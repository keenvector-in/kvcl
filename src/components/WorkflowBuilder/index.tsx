import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type NodeChange,
} from '@xyflow/react';
import { Plus, Redo2, Undo2 } from 'lucide-react';
import { workflowNodeCatalog, workflowNodeGroups, type WorkflowNodeSpec } from './catalog';
import { CanvasNode, NodeActionsContext, type CanvasNodeType } from './CanvasNode';
import { NodeConfigPanel } from './NodeConfigPanel';
import { kindStyles } from './styles';
import type { WorkflowEdge, WorkflowGraph, WorkflowNode } from './types';

export interface WorkflowBuilderProps {
  /**
   * Graph to start from. The builder owns its state after mount — to load a
   * different workflow, remount it with a new `key`.
   */
  defaultValue: WorkflowGraph;
  /** Called after every edit (not on selection) with the whole graph. */
  onChange?: (graph: WorkflowGraph) => void;
  readOnly?: boolean;
  /** Left side of the toolbar — typically the workflow name. */
  title?: ReactNode;
  /** Right side of the toolbar — typically Test / Save / Publish. */
  actions?: ReactNode;
  className?: string;
}

const nodeTypes = { wf: CanvasNode };
const DRAG_MIME = 'application/kv-workflow-node';
const HISTORY_LIMIT = 50;

type Snapshot = { nodes: CanvasNodeType[]; edges: Edge[] };

const toCanvasNode = (node: WorkflowNode): CanvasNodeType => ({ id: node.id, type: 'wf', position: node.position, data: { node } });

const toCanvasEdge = (edge: WorkflowEdge): Edge => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  sourceHandle: edge.source_handle || null,
  label: edge.source_handle ? edge.source_handle.toUpperCase() : undefined,
});

function toGraph(nodes: CanvasNodeType[], edges: Edge[]): WorkflowGraph {
  return {
    nodes: nodes.map((n) => ({ ...n.data.node, position: { x: n.position.x, y: n.position.y } })),
    edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target, source_handle: e.sourceHandle ?? '' })),
  };
}

function Builder({ defaultValue, onChange, readOnly = false, title, actions, className = '' }: WorkflowBuilderProps) {
  const { screenToFlowPosition } = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<CanvasNodeType[]>(() => defaultValue.nodes.map(toCanvasNode));
  const [edges, setEdges] = useState<Edge[]>(() => defaultValue.edges.map(toCanvasEdge));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Bumped on every real edit; the effect below reports the graph once the
  // new state has rendered. Selection alone never bumps it.
  const [revision, setRevision] = useState(0);
  const history = useRef<Snapshot[]>([]);
  const future = useRef<Snapshot[]>([]);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  useEffect(() => {
    if (revision > 0) onChangeRef.current?.(toGraph(nodes, edges));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- report per revision, not per render
  }, [revision]);
  const edited = useCallback(() => setRevision((r) => r + 1), []);

  const checkpoint = useCallback(() => {
    history.current.push({ nodes, edges });
    if (history.current.length > HISTORY_LIMIT) history.current.shift();
    future.current = [];
  }, [nodes, edges]);

  const restore = (from: Snapshot[], to: Snapshot[]) => {
    const snap = from.pop();
    if (!snap) return;
    to.push({ nodes, edges });
    setNodes(snap.nodes);
    setEdges(snap.edges);
    setSelectedId(null);
    edited();
  };

  const onNodesChange = useCallback(
    (changes: NodeChange<CanvasNodeType>[]) => {
      if (changes.some((c) => c.type === 'remove')) checkpoint();
      setNodes((nds) => applyNodeChanges(changes, nds));
      if (changes.some((c) => c.type === 'remove' && c.id === selectedId)) setSelectedId(null);
      if (changes.some((c) => c.type !== 'select' && c.type !== 'dimensions')) edited();
    },
    [checkpoint, edited, selectedId],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
      if (changes.some((c) => c.type !== 'select')) edited();
    },
    [edited],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source === connection.target) return;
      checkpoint();
      const handle = connection.sourceHandle ?? '';
      setEdges((eds) =>
        addEdge({ ...connection, id: crypto.randomUUID(), label: handle ? handle.toUpperCase() : undefined }, eds),
      );
      edited();
    },
    [checkpoint, edited],
  );

  const addNode = (spec: WorkflowNodeSpec, position: { x: number; y: number }) => {
    checkpoint();
    const node: WorkflowNode = { id: crypto.randomUUID(), type: spec.type, label: spec.label, position, config: { ...spec.defaults } };
    setNodes((nds) => [...nds, toCanvasNode(node)]);
    setSelectedId(node.id);
    edited();
  };

  const addAtCenter = (spec: WorkflowNodeSpec) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    const center = rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : { x: 0, y: 0 };
    addNode(spec, screenToFlowPosition(center));
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    const spec = workflowNodeCatalog[e.dataTransfer.getData(DRAG_MIME)];
    if (spec) addNode(spec, screenToFlowPosition({ x: e.clientX, y: e.clientY }));
  };

  const selected = useMemo(() => nodes.find((n) => n.id === selectedId)?.data.node ?? null, [nodes, selectedId]);

  const patchSelected = (patch: Partial<Pick<WorkflowNode, 'label' | 'config'>>) => {
    setNodes((nds) => nds.map((n) => (n.id === selectedId ? { ...n, data: { node: { ...n.data.node, ...patch } } } : n)));
    edited();
  };

  const removeNode = (id: string) => {
    checkpoint();
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    if (id === selectedId) setSelectedId(null);
    edited();
  };
  const deleteSelected = () => selectedId && removeNode(selectedId);
  const nodeActions = useMemo(() => (readOnly ? null : { edit: setSelectedId, remove: removeNode }), [readOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  const iconButton = 'rounded-md p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900';

  return (
    <div className={`flex h-full min-h-[480px] flex-col overflow-hidden rounded-xl border border-ink-200/60 bg-white ${className}`}>
      <div className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-ink-200 px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          {title}
          {!readOnly && (
            <div className="flex items-center gap-1 border-l border-ink-200 pl-3">
              <button type="button" className={iconButton} onClick={() => restore(history.current, future.current)} aria-label="Undo">
                <Undo2 className="h-4 w-4" aria-hidden />
              </button>
              <button type="button" className={iconButton} onClick={() => restore(future.current, history.current)} aria-label="Redo">
                <Redo2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {!readOnly && (
          <aside aria-label="Steps" className="w-56 shrink-0 overflow-y-auto border-r border-ink-200 bg-ink-50 p-3">
            {workflowNodeGroups.map((group) => (
              <div key={group.title} className="mb-4">
                <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wide text-ink-400">{group.title}</p>
                <div className="flex flex-col gap-1">
                  {group.specs.map((spec) => (
                    <button
                      key={spec.type}
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(DRAG_MIME, spec.type);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onClick={() => addAtCenter(spec)}
                      title={spec.preview ? `${spec.label} — preview, can't be published yet` : `Add ${spec.label}`}
                      className="flex cursor-grab items-center gap-2 rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-left text-xs font-medium text-ink-700 shadow-sm hover:border-brand-300 hover:bg-brand-50/40 active:cursor-grabbing"
                    >
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${kindStyles[spec.kind].dot}`} />
                      <span className="flex-1 truncate">{spec.label}</span>
                      {spec.preview ? (
                        <span className="text-[9px] font-semibold uppercase text-ink-400">Soon</span>
                      ) : (
                        <Plus className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </aside>
        )}

        <div
          ref={wrapperRef}
          className="relative flex-1"
          onDragOver={
            readOnly
              ? undefined
              : (e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }
          }
          onDrop={readOnly ? undefined : onDrop}
        >
          <NodeActionsContext.Provider value={nodeActions}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={readOnly ? undefined : onNodesChange}
            onEdgesChange={readOnly ? undefined : onEdgesChange}
            onConnect={readOnly ? undefined : onConnect}
            onNodeClick={(_, node) => setSelectedId(node.id)}
            onPaneClick={() => setSelectedId(null)}
            deleteKeyCode={readOnly ? [] : ['Backspace', 'Delete']}
            nodesDraggable={!readOnly}
            nodesConnectable={!readOnly}
            minZoom={0.4}
            fitView
          >
            <Background gap={16} />
            <Controls showInteractive={!readOnly} />
            <MiniMap pannable zoomable />
          </ReactFlow>
          </NodeActionsContext.Provider>
        </div>

        <aside aria-label="Step settings" className="w-72 shrink-0 overflow-y-auto border-l border-ink-200 bg-white max-md:hidden">
          {selected ? (
            <NodeConfigPanel node={selected} onChange={patchSelected} onDelete={deleteSelected} readOnly={readOnly} />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-ink-400">
              {readOnly ? 'Click a step to view its settings.' : 'Click a step to edit it. Use + in the left list to add one.'}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

/**
 * Drag-and-drop editor for a tenant's communication workflow: step palette,
 * canvas, and a settings panel for the selected step. Produces a plain
 * WorkflowGraph — what edge-gateway's /api/workflows stores.
 */
export function WorkflowBuilder(props: WorkflowBuilderProps) {
  return (
    <ReactFlowProvider>
      <Builder {...props} />
    </ReactFlowProvider>
  );
}

export type { WorkflowEdge, WorkflowGraph, WorkflowNode } from './types';
