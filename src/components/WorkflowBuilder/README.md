# WorkflowBuilder

Drag-and-drop editor for a tenant's communication workflow — step palette, canvas
(React Flow), and a settings panel for the selected step. Layout and step list follow
the sandesha_v1.0 prototype's workflow builder.

```tsx
import { WorkflowBuilder, type WorkflowGraph } from "@keenvector/kvcl";

<WorkflowBuilder
  key={workflow.id}                 // remount to load a different workflow
  defaultValue={workflow.graph}
  onChange={setGraph}               // whole graph after every edit
  title={<NameInput />}
  actions={<><TestButton /><SaveButton /></>}
/>
```

- **Uncontrolled.** `defaultValue` is read once; change `key` to load another graph.
- `WorkflowGraph` is the wire shape edge-gateway's `/api/workflows` stores — pass it
  straight through, no mapping.
- Steps are defined in `catalog.ts`. Type ids and config keys must match
  `core-engine/services/workflow-engine/lib/catalog.go`; `preview: true` marks steps the
  engine can't run yet (shown as "Soon", publish rejects them).
- Needs `@xyflow/react` as a peer dependency. Its stylesheet ships inside
  `@keenvector/kvcl/styles.css`.
- Give it a height: it fills its parent (`h-full`, min 480px).
