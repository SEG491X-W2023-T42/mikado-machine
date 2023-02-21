export function createNodeObject(id, x, y, label) {
  return  {
    id,
    position: { x, y },
    data: { label },
  };
}

export function createEdgeObject(source, target) {
  return { id: `e${source}-${target}`, source, target };
}
