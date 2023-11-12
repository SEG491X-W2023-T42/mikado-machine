import AuthenticatedUidWrapper from "../../context/AuthenticatedUidWrapper";
import GraphViewer from "./GraphViewer";

function GraphPage() {
  return <AuthenticatedUidWrapper wrapped={GraphViewer} />
}

export default GraphPage;
