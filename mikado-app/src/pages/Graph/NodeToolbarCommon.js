import { useStoreHack } from "../../StoreHackContext";
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
    <button aria-label="Delete" data-icon="delete" onClick={() => operations.deleteNode(id)} />
    {!allowSubgraph ? null : <button
      aria-label={subgraph ? "Enter subgraph" : "Create subgraph"}
      data-icon={subgraph ? "enter-subgraph" : "create-subgraph"}
      onClick={() => enterGraph((uid) => operations.createSubgraphAndSaveIfNotExists(uid, id))}
    />}
  </>
}
