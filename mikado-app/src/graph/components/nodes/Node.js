import { ConnectionMode, Handle, NodeToolbar } from "reactflow";
import { useEnterGraphHack } from "../../../context/EnterGraphHackContext";
import { runtime_assert } from "../../../graphlayer/store/Assert";
import { useStoreHack } from "../../../context/StoreHackContext";
import SeamlessEditor from "../SeamlessEditor";
import { getGatekeeperFlags } from "../../../graphlayer/store/Gatekeeper";
import { ArrowDownward, ArrowUpward} from '@mui/icons-material';

export const MY_NODE_CONNECTION_MODE = ConnectionMode.Loose;

const selector = (state) => {
  const { editingNodeId, editingNodeInitialValue, editNode, operations } = state;
  return { editingNodeId, editingNodeInitialValue, editNode, operations };
};

const ARIA_LABELS = {
  "complete": "Completed",
  "goal": "Goal",
  "locked": "Blocked",
  "ready": "Ready",
};

export default function Node({ id, data, type, exporting = false, ...rest }) {
  const { allowRemoveNode, allowSubgraph, allowModifyNodeCompletion } = getGatekeeperFlags();
  const { editingNodeId, editingNodeInitialValue, editNode, operations } = exporting ? {} : useStoreHack()(selector);
  const editing = editingNodeId === id;

  const subgraph = operations?.isNodeSubgraph(id);
  const enterGraph = useEnterGraphHack();

  const isInSubgraph = operations?.isNodeInSubgraph();

  const notGoal = type !== "goal";
  const notLocked = type !== "locked";
  const completed = type === "complete";
  const ariaLabel = ARIA_LABELS[type];
  runtime_assert(ariaLabel);


  const result = <>
    {exporting ? null : <NodeToolbar>
      {allowRemoveNode && <button aria-label="Delete" data-icon="delete" onClick={() => operations.deleteNode(id)} />}
      {allowSubgraph && notGoal && !subgraph && <button
        aria-label= "Create subgraph"
        data-icon="create-subgraph"
        onClick={() => enterGraph((uid) => operations.createSubgraphAndSaveIfNotExists(uid, id))}
      />}
      {allowModifyNodeCompletion && notGoal && notLocked && <button
        aria-label={completed ? "Mark incomplete" : "Mark completed"}
        data-icon={completed ? "incomplete" : "completed"}
        onClick={() => void operations.setNodeCompleted(id, !completed)}
      />}
    </NodeToolbar>}

    <div className="content-wrapper">
      <SeamlessEditor
        label={data.label}
        editing={editing}
        exporting={exporting}
        initialValue={!editing ? "" : editingNodeInitialValue}
        onFinishEditing={(filteredText) => {
          editNode("", "");
          operations.setNodeLabel(id, filteredText);
        }}
        singleLine={false}
      />
      <div className="node-icon-wrapper">
        <div aria-label={ariaLabel} />
      </div>
    </div>
    
    {exporting ? null : <Handle />}
    {(subgraph || (isInSubgraph && !notGoal)) && //if node has a subgraph, or if a node is the root node of a subgraph
      <button className="enter-exit-subgraph-button" // button to enter or exit subgraph
        aria-label = {notGoal? "Enter subgraph" : "Return to parent graph"}
        onClick= {notGoal? () => enterGraph((uid) => operations.createSubgraphAndSaveIfNotExists(uid, id)) 
                  : console.log("Returning to parent graph") //DISH : here is where return-to-parent logic needs to be.
                }
      >
        {notGoal? <ArrowDownward sx={{fontSize:16}} /> : <ArrowUpward sx={{fontSize:16}}/>}
        {notGoal? "Enter subgraph" : "Return to parent graph"}
      </button>
    }

  </>;
  if (exporting) {
    const { position, positionOffset } = rest; // Exists when exporting only
    return <div
      style={{
        position: "absolute",
        left: position.x + positionOffset.x + "px",
        top: position.y + positionOffset.y + "px",
      }}
      className={"react-flow__node react-flow__node-" + type}
    >
      {result}
    </div>
  }
  return result;
}
