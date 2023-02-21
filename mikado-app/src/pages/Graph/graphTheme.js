import { BezierEdge, MarkerType } from "reactflow";
import { createElement } from "react";

const EDGE_PROPS = {
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

export const EDGE_TYPES = {
  /**
   * Override default (and, so far, only) edge type
   */
  default(props) {
    // Seems like BezierEdge is a MemoExoticComponent not a FC
    return createElement(BezierEdge, { ...props, ...EDGE_PROPS });
  }
};
