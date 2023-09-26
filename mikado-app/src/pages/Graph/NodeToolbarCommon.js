import DeleteIcon from "@mui/icons-material/Delete";
import { useStoreHack } from "../../StoreHackContext";

const operationsSelector = (state) => state.operations;

export function useNodeToolbarCommonOperations() {
  return useStoreHack()(operationsSelector);
}

export default function NodeToolbarCommon({ id }) {
  const operations = useNodeToolbarCommonOperations();

  return <>
    <button onClick={() => operations.deleteNode(id)}>
      <DeleteIcon />
    </button>
  </>
}
