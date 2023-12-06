// export function serializeSelection(nodes, edges, nodeIds) {
//   const myNodes = [];
//   const nodesIdToNodesI = {};
//   for (const i in nodes) {
//     nodesIdToNodesI[nodes[i].id] = i;
//   }
//   const nodesIToMyNodesI = {};
//   for (const id of nodeIds) {
//     myNodes.push(nodes[nodesIdToNodesI[id]]);
//     nodesIToMyNodesI[]
//     myNodes[oldToNew[id]] = nodes[oldToNew[id]];
//   }
//   let minX = 0;
//   let minY = 0;
//   for (const node of myNodes) {
//     minX = Math.min(minX, node.x);
//     minY = Math.min(minY, node.y);
//   }
//   const saveNodes = [];
//   for (const node of myNodes) {
//     saveNodes.push({
//       x: node.x - minX,
//       y: node.y - minY,
//       label: node.label,
//     });
//   }
//   return "Mikado" + JSON.stringify(saveNodes);
// }

// export function deserializeSelection(input) {
//   if (!input.startsWith("Mikado[")) return void 0;
//   input = input.substring(6);
//   const saveNodes = JSON.parse(input);
//   // eslint-disable-next-line no-debugger
//   debugger;
//   const myNodes = [];
//   const oldToNew = {};
//   for (const i in nodes) {
//     oldToNew[nodes[i].id] = i;
//   }
//   for (const id of nodeIds) {
//     myNodes[oldToNew[id]] = nodes[oldToNew[id]];
//   }
//   let minX = 0;
//   let minY = 0;
//   for (const node of myNodes) {
//     minX = Math.min(minX, node.x);
//     minY = Math.min(minY, node.y);
//   }
//   const saveNodes = [];
//   for (const node of myNodes) {
//     saveNodes.push({
//       x: node.x - minX,
//       y: node.y - minY,
//       label: node.label,
//     });
//   }
//   return "Mikado" + JSON.stringify(saveNodes);
// }
