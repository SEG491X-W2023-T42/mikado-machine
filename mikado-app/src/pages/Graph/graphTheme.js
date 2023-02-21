import { MarkerType, StraightEdge } from "reactflow";

export const DEFAULT_EDGE_OPTIONS = {
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 10,
    height: 10,
    color: "black",
  },
  style: {
    strokeWidth: 3,
    stroke: "black",
  }
};

export const EDGE_TYPES = {
  /**
   * Override default (and, so far, only) edge type
   */
  default: StraightEdge,
};
