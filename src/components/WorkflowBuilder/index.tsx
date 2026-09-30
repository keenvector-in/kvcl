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
import { kindStyles, typeIcons } from './styles';
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
const NODE_GAP = 190; // vertical spacing between chained steps, in flow units (nodes now show a summary)
const MINIMAP_MIN_NODES = 8;

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

  // Read through a ref so callbacks memoised elsewhere (the node toolbar, xyflow handlers) never
  // checkpoint a stale graph.
  const latest = useRef<Snapshot>({ nodes, edges });
  latest.current = { nodes, edges };
  const checkpoint = useCallback(() => {
    const snap = latest.current;
    // Deleting a node removes its edges in a second change batch from the same render — one undo step.
    const last = history.current.at(-1);
    if (last && last.nodes === snap.nodes && last.edges === snap.edges) return;
    history.current.push(snap);
    if (history.current.length > HISTORY_LIMIT) history.current.shift();
    future.current = [];
  }, []);

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
      if (changes.some((c) => c.type === 'remove')) checkpoint();
      setEdges((eds) => applyEdgeChanges(changes, eds));
      if (changes.some((c) => c.type !== 'select')) edited();
    },
    [checkpoint, edited],
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
    return node.id;
  };

  // "+" chains below the selected step (and wires it when that step has a single output);
  // otherwise it drops at the viewport centre, stepping down past any step already there.
  const addAtCenter = (spec: WorkflowNodeSpec) => {
    const parent = nodes.find((n) => n.id === selectedId);
    let position: { x: number; y: number };
    if (parent) {
      position = { x: parent.position.x, y: parent.position.y + NODE_GAP };
    } else {
      const rect = wrapperRef.current?.getBoundingClientRect();
      const center = rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : { x: 0, y: 0 };
      position = screenToFlowPosition(center);
    }
    while (nodes.some((n) => Math.abs(n.position.x - position.x) < NODE_GAP && Math.abs(n.position.y - position.y) < NODE_GAP / 2)) {
      position = { ...position, y: position.y + NODE_GAP };
    }
    const newId = addNode(spec, position);
    const parentSpec = parent && workflowNodeCatalog[parent.data.node.type];
    if (parent && spec.kind !== 'trigger' && parentSpec && !parentSpec.branching && parentSpec.kind !== 'end') {
      setEdges((eds) => addEdge({ source: parent.id, target: newId, sourceHandle: null, targetHandle: null, id: crypto.randomUUID() }, eds));
    }
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

  const iconButton = 'rounded-md p-1.5 text-fg-muted hover:bg-sunken hover:text-fg';

  const paletteItem = (spec: WorkflowNodeSpec) => {
    const Icon = typeIcons[spec.type] ?? kindStyles[spec.kind].icon;
    return (
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
        className="flex cursor-grab items-center gap-2.5 rounded-lg border border-line bg-surface px-2.5 py-2 text-left text-sm font-medium text-fg shadow-sm hover:border-brand-300 hover:bg-brand-500/10 active:cursor-grabbing"
      >
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${kindStyles[spec.kind].bg} ${kindStyles[spec.kind].text}`}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span className="flex-1 truncate">{spec.label}</span>
        {spec.preview ? (
          <span className="text-[10px] font-semibold uppercase text-fg-subtle">Soon</span>
        ) : (
          <Plus className="h-4 w-4 text-fg-subtle" aria-hidden />
        )}
      </button>
    );
  };

  return (
    <div className={`flex h-full min-h-[480px] flex-col overflow-hidden rounded-xl border border-line bg-surface ${className}`}>
      <div className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          {title}
          {!readOnly && (
            <div className="flex items-center gap-1 border-l border-line pl-3">
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
          <aside aria-label="Steps" className="w-64 shrink-0 overflow-y-auto border-r border-line bg-sunken p-3">
            {workflowNodeGroups.map((group) => {
              const ready = group.specs.filter((s) => !s.preview);
              const soon = group.specs.filter((s) => s.preview);
              return (
                <div key={group.title} className="mb-4">
                  <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">{group.title}</p>
                  <div className="flex flex-col gap-1.5">{ready.map(paletteItem)}</div>
                  {soon.length > 0 && (
                    // Preview steps can be designed and tested but not published — out of the way until asked for.
                    <details className="mt-1 group/soon">
                      <summary className="cursor-pointer list-none px-1 py-1 text-xs text-fg-subtle hover:text-fg">
                        <span className="group-open/soon:hidden">+ {soon.length} coming soon</span>
                        <span className="hidden group-open/soon:inline">− Coming soon</span>
                      </summary>
                      <div className="flex flex-col gap-1.5 opacity-80">{soon.map(paletteItem)}</div>
                    </details>
                  )}
                </div>
              );
            })}
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
            onNodeDragStart={readOnly ? undefined : checkpoint}
            onConnect={readOnly ? undefined : onConnect}
            onNodeClick={(_, node) => setSelectedId(node.id)}
            onPaneClick={() => setSelectedId(null)}
            deleteKeyCode={readOnly ? [] : ['Backspace', 'Delete']}
            nodesDraggable={!readOnly}
            nodesConnectable={!readOnly}
            minZoom={0.4}
            fitView
            fitViewOptions={{ padding: 0.2 }}
          >
            <Background gap={16} />
            <Controls showInteractive={!readOnly} />
            {/* A handful of steps all fit on screen; below that the minimap only covers them. */}
            {nodes.length > MINIMAP_MIN_NODES && <MiniMap pannable zoomable style={{ width: 140, height: 90 }} />}
          </ReactFlow>
          {nodes.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
              <div className="max-w-xs rounded-xl border border-dashed border-line-strong bg-surface/90 p-5 text-center shadow-sm">
                <p className="text-sm font-semibold text-fg">{readOnly ? 'This workflow has no steps.' : 'Start with a trigger'}</p>
                {!readOnly && (
                  <p className="mt-1 text-xs text-fg-muted">
                    Click <span className="font-medium text-fg">+</span> next to <span className="font-medium text-fg">Incoming Message</span>, then
                    select it and add the next step — new steps connect below the selected one.
                  </p>
                )}
              </div>
            </div>
          )}
          </NodeActionsContext.Provider>
        </div>

        <aside aria-label="Step settings" className="w-80 shrink-0 overflow-y-auto border-l border-line bg-surface max-md:hidden">
          {selected ? (
            <NodeConfigPanel node={selected} onChange={patchSelected} onDelete={deleteSelected} readOnly={readOnly} />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-fg-subtle">
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
