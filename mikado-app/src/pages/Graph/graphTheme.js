import { MarkerType } from "reactflow";

export const DEFAULT_EDGE_OPTIONS = {
  markerStart: {
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
