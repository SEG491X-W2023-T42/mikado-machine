import { ConnectionLineType, MarkerType, StraightEdge } from "reactflow";

export const CONNECTION_LINE_STYLE = {
  strokeWidth: 3,
  stroke: "black",
};
export const CONNECTION_LINE_TYPE = ConnectionLineType.Straight;

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
  default: StraightEdge,
};
