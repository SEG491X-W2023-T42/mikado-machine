import DeleteIcon from "@mui/icons-material/Delete";
import { useStoreHack } from "../../StoreHackContext";
import AddIcon from "@mui/icons-material/Add";
import Login from "@mui/icons-material/Login";
import { useEnterGraphHack } from "./EnterGraphHackContext";

const operationsSelector = (state) => state.operations;

export function useNodeToolbarCommonOperations() {
  return useStoreHack()(operationsSelector);
}

export default function NodeToolbarCommon({ id, allowSubgraph }) {
  const operations = useNodeToolbarCommonOperations();
  const subgraph = operations.isNodeSubgraph(id);
  const enterGraph = useEnterGraphHack();

  return <>
    <button onClick={() => operations.deleteNode(id)}>
      <DeleteIcon />
    </button>
    {!allowSubgraph ? null : <button onClick={() => enterGraph((uid) => operations.createSubgraphAndSaveIfNotExists(uid, id))}>
      {subgraph ? <Login /> : <AddIcon />}
    </button>}
  </>
}
