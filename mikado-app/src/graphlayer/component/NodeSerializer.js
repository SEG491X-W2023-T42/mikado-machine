function getMinXY(nodes) {
  if (!nodes.length) {
    return {x: 0, y: 0};
  }
  const firstNode = nodes[0];
  let x = firstNode[1];
  let y = firstNode[2];
  for (const node of nodes) {
    x = Math.min(x, node[1]);
    y = Math.min(y, node[2]);
  }
  return { x, y };
}

export function serializeSelection(nodes, edges, nodeIds) {
  const resultNodes = [];
  const oldNodeIdsToResultNodeIndices = {};
  const wantedNodeIds = new Set(nodeIds);
  for (const node of nodes) {
    const { id, position: { x, y }, data: { label }, type } = node;
    if (!wantedNodeIds.has(node.id)) continue;
    oldNodeIdsToResultNodeIndices[id] = resultNodes.length;
    resultNodes.push([
      label,
      x,
      y,
      +(type === "complete"),
    ]);
  }
  const { x: minX, y: minY } = getMinXY(resultNodes);
  for (const node of resultNodes) {
    node[1] -= minX;
    node[2] -= minY;
  }
  const resultEdges = [];
  for (const edge of edges) {
    const { source, target } = edge;
    const newSource = oldNodeIdsToResultNodeIndices[source] ?? -1;
    const newTarget = oldNodeIdsToResultNodeIndices[target] ?? -1;
    if (newSource < 0 || newTarget < 0) continue;
    resultEdges.push([newSource, newTarget]);
  }
  return "Mikado" + JSON.stringify([resultNodes, resultEdges]);
}

export function deserializeSelection(input, position) {
  if (!input.startsWith("Mikado[")) return void 0;
  input = input.substring(6);
  const positions = [];
  const labels = [];
  const toComplete = [];
  const toConnect = [];
  try {
    const data = JSON.parse(input);
    if (!Array.isArray(data) || data.length !== 2) return void 0;
    const [dataNodes, dataEdges] = data;
    for (const [id, node] of dataNodes.entries()) {
      const [label, x, y, complete] = node;
      labels.push("" + label);
      // This might overlap, but so would editing text, so allow it
      positions.push({x: +x, y: +y});
      if (complete) {
        toComplete.push(id);
      }
    }
    const { length } = dataNodes;
    for (let [source, target] of dataEdges) {
      source = +source;
      target = +target;
      if (source < 0 || source >= length || target < 0 || target >= length) return void 0;
      toConnect.push([source, target]);
    }
  } catch (e) {
    console.error(e);
    return void 0;
  }
  return [positions, labels, toComplete, toConnect];
}
