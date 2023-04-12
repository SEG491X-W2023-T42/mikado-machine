export function createNodeObject(id, x, y, type, label = "New Node", completed = false) {
  // Not using React Flow's className as that may lead to maintainability problems
  return {
    id,
    position: { x, y },
    data: { label, completed },
    type: type
  };
}

export function createEdgeObject(source, target) {
  return { id: `e${source}-${target}`, source, target };
}
