import AuthenticatedUidWrapper from "../../context/AuthenticatedUidWrapper";
import GraphViewer from "./GraphViewer";

function GraphWrapper() {
  return <AuthenticatedUidWrapper wrapped={GraphViewer} />
}

export default GraphWrapper;
