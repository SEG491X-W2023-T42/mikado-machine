import { MarkerType } from "reactflow";
import FloatingEdge from "../../helpers/FloatingEdge";
import Node from "../../graph/components/nodes/Node";

export const DEFAULT_EDGE_OPTIONS = {
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 10,
    height: 10,
    color: "black",
  },
};

export const EDGE_TYPES = {
  /**
   * Override default (and, so far, only) edge type
   */
  default: FloatingEdge,
};

function AssertFalseNode() {
  throw new TypeError("Unreachable node type");
}

export const NODE_TYPES = {
  /**
   * Override default (and, so far, only) node type
   */
  default: AssertFalseNode,
  goal: Node,
  ready: Node,
  locked: Node,
  complete: Node,
}
