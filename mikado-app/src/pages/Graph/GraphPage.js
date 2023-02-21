import AuthenticatedUidWrapper from "../../context/AuthenticatedUidWrapper";
import Plaza from "./Plaza";

function GraphPage() {
  return <AuthenticatedUidWrapper wrapped={Plaza} />
}

export default GraphPage;
