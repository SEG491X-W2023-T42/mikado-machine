import { MarkerType } from "reactflow";
import MyNode from "./MyNode";
import GoalNode from "./GoalNode";
import ReadyNode from "./ReadyNode";
import FloatingEdge from "./FloatingEdge";
import LockedNode from "./LockedNode";
import CompleteNode from "./CompleteNode"

export const CONNECTION_LINE_STYLE = {
  strokeWidth: 3,
  stroke: "black",
};

export const DEFAULT_EDGE_OPTIONS = {
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 10,
    height: 10,
    color: "black",
  },
  style: CONNECTION_LINE_STYLE,
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
  goal: GoalNode,
  ready: ReadyNode,
  locked: LockedNode,
  complete: CompleteNode,
}
