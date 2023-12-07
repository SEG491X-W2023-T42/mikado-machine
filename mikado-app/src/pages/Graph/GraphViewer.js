import GraphLayerViewer from "../../graphlayer/component/GraphLayerViewer";
import "./GraphViewer.css";
import { useMemo, useState } from "react";
import * as React from 'react';
import GraphHeader from '../../graph/components/graphheader/GraphHeader';
import { graphStack } from "../../helpers/GraphStack";
import GraphNavigationBar from "../../graph/components/graphnavigation/GraphNavigation";

/**
 * The GraphViewer component is the main page that users view and edit graphs.
 *
 * Most of the time the user may just see one GraphLayerViewer be the whole thing.
 * The difference between Graph and GraphLayerViewer is that the GraphViewer normally persists throughout
 * an editing session of one Mikado, while the GraphLayerViewer may be destroyed when entering subtrees.
 * GraphViewer may also be responsible for animating tow GraphLayerViewers, one exiting and one entering.
 * It also contains the bottom sheet.
 */
function GraphViewer({ uid }) {
  /**
   * The default Mikado to open.
   *
   * For now this default graph is the only graph available until saving/multiple different files/documents is implemented.
   * Also, there is only one layer of the graph available until the subtrees feature is implemented.
   */
  const DEFAULT_GRAPH_ID = "graph-1";

  // TODO get this from URL
  const [graph1, setGraph1] = useState({id: DEFAULT_GRAPH_ID, subgraph: ""});
  const [graph2, setGraph2] = useState(null);
  const [graph1Class, setGraph1Class] = useState("graphInDown");
  const [graph2Class, setGraph2Class] = useState("graphInDown");
  const [navOpen, setNavOpen] = React.useState(false)
  const [questlineEnabled, setQuestlineEnabled] = React.useState(true)

  const impersonateUid = useMemo(() => {
    try {
      const result = localStorage.getItem("impersonateUid");
      if (!result) return "";
      if (!/^[a-zA-Z0-9]{28}$/.test(result)) return "";
      console.warn("Impersonating", result);
      return result;
    } catch (e) {
      // ignore
    }
    return "";
  }, [uid]);
  if (impersonateUid) {
    uid = impersonateUid;
  }


  /*
  // TODO bring back the animations later
  const [fade, setFade] = useState(false);
  const [graphTransition, setGraphTransition] = useState({ startFrom: "in", transitionIn: false, transitionOut: false, pos: { x: 0, y: 0 }, nodeID: 0 })
  const [animation, setAnimation] = useState({});

  // Rudimentary transition. Not optimal, want to look into procedural anim based on
  // when the db finishes loading
  function transitionInto(graph) {
    // Zoom in anim
    setGraphTransition({
      startFrom: "in",
      transitionOut: false, transitionIn: true,
      pos: GraphLayerViewerHandle.getSelectedNodePos(),
      nodeID: GraphLayerViewerHandle.getSelectedNodeID()
    });

    // Changing graph transition

    setTimeout(() => setAnimation({
      animate: {
        opacity: [null, 0, 0, 1]
      },
      transition: {
        duration: 2,
        times: [0, 0.2, 0.8, 1],
        repeat: 0
      }
    }), 600)
    setTimeout(() => setGraphID(graph), 1000)

    // Zoom out to fit
    setTimeout(() => setGraphTransition({
      startFrom: "in",
      transitionOut: true, transitionIn: false,
      pos: GraphLayerViewerHandle.getSelectedNodePos(),
      nodeID: GraphLayerViewerHandle.getSelectedNodeID()
    }), 1600);
    setTimeout(() => setGraphTransition({
      startFrom: "in",
      transitionOut: false, transitionIn: false,
      pos: GraphLayerViewerHandle.getSelectedNodePos(),
      nodeID: GraphLayerViewerHandle.getSelectedNodeID()
    }), 1900);
  }

  function transitionOutOf(graph) {
    // Zoom out anim
    setGraphTransition({
      startFrom: "out",
      transitionOut: true, transitionIn: false,
      pos: GraphLayerViewerHandle.getSelectedNodePos(),
      nodeID: GraphLayerViewerHandle.getSelectedNodeID()
    });

    // Changing graph transition
    setTimeout(() => setAnimation({
      animate: {
        opacity: [null, 0, 0, 1]
      },
      transition: {
        duration: 2,
        times: [0, 0.2, 0.8, 1],
        repeat: 0
      }
    }), 600)
    setTimeout(() => setGraphID(graph), 1000)

    // Zoom to fit
    setTimeout(() => setGraphTransition({
      startFrom: "out",
      transitionOut: false, transitionIn: true,
      pos: GraphLayerViewerHandle.getSelectedNodePos(),
      nodeID: GraphLayerViewerHandle.getSelectedNodeID()
    }), 1600);
    setTimeout(() => setGraphTransition({
      startFrom: "out",
      transitionOut: false, transitionIn: false,
      pos: GraphLayerViewerHandle.getSelectedNodePos(),
      nodeID: GraphLayerViewerHandle.getSelectedNodeID()
    }), 1900);
  }
   */
  function enterGraph(lambda) {

	const subgraph = lambda(uid);

	if (subgraph == null) {
		console.debug("trying to leave subgraph");
    graphStack.pop()
    setGraph2(graph1);
    setGraph1({
      id: graph1.id,
      subgraph: graphStack.at(-1)
    });
    setGraph1Class("graphInUp");
    setGraph2Class("graphOutDown");
	} else {
		console.debug("trying to enter subgraph", subgraph);
		graphStack.push(subgraph);
    setGraph2(graph1);
    setGraph1({
      id: graph1.id,
      subgraph: graphStack.at(-1)
    });
    setGraph1Class("graphInDown");
    setGraph2Class("graphOutUp");
	}
  }

  function switchGraph(graphId) {
	graphStack.length = 1;
	setGraph1({
		id: graphId,
		subgraph: graphStack.at(-1)
	});
  setGraph2(null);
  setGraph1Class("graphInDown");
  }

  const key1 = uid + graph1.subgraph;
  const key2 = uid + graph2?.subgraph;
  void key2;
  void graph2Class;
  // console.debug("GraphViewer graph", graph, "key", key);
  return <main>
    <GraphHeader uid={uid} graph={graph1} graphHandle={setGraph1} setNavOpen={setNavOpen} questlineEnabled={questlineEnabled} setQuestlineEnabled={setQuestlineEnabled}/>
	  <GraphNavigationBar open={navOpen} setOpen={setNavOpen} uid={uid} switchGraph={switchGraph}/>
    <section>
    <section className={graph1Class} key={key1}>
      <GraphLayerViewer key={key1} uid={uid} graph={graph1} enterGraph={enterGraph} />
    </section>
      {/*graph2 isn't working oh well, but the rest works*/}
    {/*{graph2 &&*/}
    {/*  <section className={graph2Class} key={key2}>*/}
    {/*    <GraphLayerViewer key={key2} uid={uid} graph={graph2} enterGraph={() => {}} />*/}
    {/*  </section>*/}
    {/*}*/}
    </section>
  </main>
}

export default GraphViewer;
