export function createNodeObject(id, x, y, type, label = "New Node", completed = false, subgraph = "") {
  // Not using React Flow's className as that may lead to maintainability problems
  return {
    id,
    position: { x, y },
    data: { label, completed },
    subgraph,
    type: type
  };
}

export function createEdgeObject(source, target, sourceLabel, targetLabel) {
  return { id: `e${source}-${target}`, source, target, ariaLabel: `${sourceLabel} needs ${targetLabel}` };
}
