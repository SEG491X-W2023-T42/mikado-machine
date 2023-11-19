import { create } from "zustand";
import { loadFromDb, saveToDb } from "../../helpers/Api";
import * as Counter from "../../helpers/Autoincrement";
import { createEdgeObject, createNodeObject } from "./DisplayObjectFactory";
import createIntersectionDetectorFor from "../../helpers/CollisionDetection";
import { dimensions } from "../../helpers/NodeConstants";
import { runtime_assert } from "./Assert";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import Node from "../../graph/components/nodes/Node";
import { getGatekeeperFlags } from "./Gatekeeper";
import { connectFirestoreEmulator } from "firebase/firestore";

/**
 * Subset of React Flow's onNodesChange.
 * This is to filter the changes so that of the user's requested changes,
 * only changes we can handle are realized.
 */
function myOnNodesChange(changes, nodes, set) {
  const changesById = {};
  let affected = false;
  for (const change of changes) {
    const { id, type } = change;
    // Ignore add, remove, reset. Those changes should be done through this viewmodel
    switch (type) {
      case "select":
      case "position":
      case "dimensions":
        break;
      default:
        continue;
    }
    affected = true;
    (changesById[id] = changesById[id] || []).push(change);
  }
  if (!affected) return;
  set({
    nodes: nodes.map(node => {
      const myChanges = changesById[node.id];
      if (!myChanges) return node;
      node = { ...node };
      for (const change of myChanges) {
        switch (change.type) {

          case "select":
            node.selected = change.selected;
            break;
          case "position": {
            const { position, dragging } = change;
            position && (node.position = position);
            node.dragging = dragging ?? node.dragging;
            // Ignoring positionAbsolute and expandParent as the DB can't persist them
            break;
          }
          case "dimensions": {
            // Store dimensions so that other places can use it
            // This is calculated on start, and not directly changed by the user
            const { dimensions } = change;
            if (dimensions) {
              node.width = dimensions.width;
              node.height = dimensions.height;
            }
            // Ignore styling and resizing as they are not used
            break;
          }
          default:
            break;
        }
      }
      return node;
    }),
  });
}

function arrayRemoveByValueIfPresent(array, value) {
  const i = array.indexOf(value);
  if (i >= 0) {
    array.splice(i, 1);
  }
}

/**
 * Separate object for functions and cache for the viewmodel.
 *
 * Its fields are modified directly to avoid getting in the way of the shallow comparison.
 * It is also here to skip shallow compare of all those methods.
 */

class GraphLayerViewerOperations {
  /*
   * GraphLayerViewer cache data.
   * This data contains caches so that computations can be efficiently performed before
   * passing them to the View (React Flow).
   */

  /**
   * A loading indicator.
   *
   * React sometimes likes to run useEffect twice, so this variable must be assigned directly and immediately.
   * This also helps with preventing other race conditions.
   */
  #loading = false;

  /**
   * The forwards connection map of arrays of IDs.
   *
   * This duplicates the edges data, but is in a format easier to manipulate. It will also be the version
   * stored in the database. The forward connections are used for depth-first search and updating
   * node completion.
   *
   * These arrays are not sorted. On one hand this allows fast insertion. On the other hand query is O(n).
   * But in practice linear scans are quite fast or even faster due to CPU caching / branch prediction.
   */
  #forwardConnections = {};

  /**
   * Current graph name
   */
  #graphName = "";

  /**
   * If the current graph is a subgraph, the node its linked to
   */
  #subgraphNodeID = ""

  /**
   * Similar to forwardConnections.
   *
   * Used mainly for deletion.
   */
  #backwardConnections = {};

  /**
   * Node labels as a map not a list.
   */
  #nodeLabels = {};

  // Zustand data

  /**
   * Sets the Zustand store state
   */
  #set;

  /**
   * Gets the Zustand store state
   */
  #get;

  /**
   * Cached state after getting
   */
  #state;

  /**
   * Quest parent branches 
   */
  #questParents;

  /**
   * Current questline
   */
  #currentQuestline;

  /**
   * Current quest tasks
   */
  #currentTasks

  constructor(set, get) {
    this.#set = set;
    this.#state = (this.#get = get)();
    const prototype = Object.getPrototypeOf(this);
    for (const name of Object.getOwnPropertyNames(prototype)) {
      if (name === "constructor") continue;
      // Patch all methods to reload the state from the store
      // This is equivalent to putting a decorator in front of each method
      const wrapped = prototype[name];
      this[name] = (...args) => {
        // Refresh the cached state
        this.#state = this.#get();
        //console.debug(this.#state);
        if (this.#loading) return; // Ignore everything while loading
        // Call function normally, while also binding it
        return wrapped.apply(this, args);
      };
    }
  }

  /**
   * Processes changes from React Flow
   */
  onNodesChange(changes) {
    myOnNodesChange(changes, this.#state.nodes, this.#set); 
  }

  /**
   * Update parent quests
   */
  updateQuestParents() {
	this.#questParents = this.#state.nodes.filter((node) => (this.#forwardConnections[this.#state.nodes.filter((node) => node.type === 'goal')[0].id]).includes(node.id));
	if (this.#currentQuestline == undefined) {
		this.#currentQuestline = this.#questParents[0]
	}
	this.updateQuest()
  }

  /**
   * Choose quest
   */
  updateQuest() {
	if (this.#questParents === undefined || this.#questParents.length == 0) {
		return;
	}

	const questlineId = this.#currentQuestline.id

	let canidateReadyNodes = this.#state.nodes.filter((node) => node.type == 'ready').map(function(node) {return node.id})
	this.#currentTasks = [];

	for (const canidateReadyNode of canidateReadyNodes) {
		let parentNodes = this.#backwardConnections[canidateReadyNode]
		let done = false;
		
		while (!done) {
			let newParentNodes = [];

			if (parentNodes.includes(questlineId.toString())) {
				this.#currentTasks.push(...this.#state.nodes.filter((node) => node.id == canidateReadyNode))
				done = true;
			} else if (parentNodes.length == 0) {
				done = true;
			}

			parentNodes.forEach((connection) => newParentNodes.push(...this.#backwardConnections[connection]))

			parentNodes = newParentNodes;
		}
	}
	console.log(this.#currentTasks);

  }

  /**
   * 
   */

  /**
   * Loads this layer from the database
   */
  load(uid, graphName, subgraphID) {
    this.#loading = true;
    loadFromDb(uid, graphName, subgraphID).then(([nodes, edges, forwardConnections, backwardConnections]) => {
		this.#forwardConnections = forwardConnections;
		this.#backwardConnections = backwardConnections;
		const nodeLabels = this.#nodeLabels = {};
		for (const node of nodes) {
		nodeLabels[node.id] = node.data.label;
		}
		this.#set({ nodes, edges, loadAutoincremented: Counter.generateAutoincremented });
		this.#loading = false;
		this.#graphName = graphName;
		this.#subgraphNodeID = subgraphID;
		this.updateQuestParents();
    });

  }

  /**
   * Saves this layer to the database
   */
  save(uid, notifyError) {
    this.#loading = true;
    saveToDb(this.#state.nodes, this.#forwardConnections, uid, this.#graphName, this.#subgraphNodeID).then(x => {
      this.#loading = false;
      x || notifyError();
    });
  }

  /**
   * Returns the new node position closest to the clicked position while not intersecting any existing nodes, or null
   */
  modifyNodePosition(position) {
    /*
     * O(w*h+n) algorithm instead of O(n**2).
     * This takes 2ms JITed on one computer with a screen full of nodes.
     * If it were slow, WebGL or WASM SIMD would have been used, but there is no need now.
     * Importantly, the time is consistent and bounded.
     * This was designed as GPU-friendly to make it easier to understand. Just think in terms of shaders.
     */
    console.time("modifyNodePosition");

    const { nodes } = this.#state;
    const { width, height } = dimensions;
    const halfWidth = (width / 2) | 0;
    const halfHeight = (height / 2) | 0;

    // Fast path when there is space where the user wants to put it
    const centeredPosition = {x: (position.x - halfWidth) | 0, y: (position.y - halfHeight) | 0};
    if (!nodes.some(createIntersectionDetectorFor({
      id: void 0,
      position: centeredPosition,
      width: width + 1,
      height: height + 1,
    }))) {
      console.timeEnd("modifyNodePosition");
      return centeredPosition;
    }

    // Virtual viewport sized to searchRadius
    /**
     * L-infinity norm radius added to node dimensions used for searching for closest free space.
     */
    const { nodePlacementSearchRadius: searchRadius } = getGatekeeperFlags();
    const viewportX = (position.x - width / 2 - searchRadius) | 0;
    const viewportY = (position.y - height / 2 - searchRadius) | 0;
    const viewportWidth = width + 2 * searchRadius;
    const viewportHeight = height + 2 * searchRadius;
    const frustum = createIntersectionDetectorFor({
      id: void 0,
      position: {x: viewportX - halfWidth, y: viewportY - halfHeight},
      width: viewportWidth + halfWidth,
      height: viewportHeight + halfHeight,
    });
    const occupancyTexture = new Int8Array(viewportWidth * viewportHeight);

    // Part 1: Rasterize all existing nodes onto the texture to mark their areas as off-limits
    for (const node of nodes) {
      if (!frustum(node)) continue;
      const { x, y } = node.position;
      // Pathfinding with a character with a size is the same thing as pathfinding with
      // second character with no size but all world objects expanded by half of the first character's size
      const screenLeft = (x | 0) - viewportX - halfWidth;
      const screenTop = (y | 0) - viewportY - halfHeight;
      const fillLeft = Math.max(0, screenLeft);
      const fillTop = Math.max(0, screenTop);
      // There was an off-by-one for some reason
      const fillRight = Math.min(viewportWidth, screenLeft + (node.width | 0) + 2 * halfWidth + 1);
      const fillBottom = Math.min(viewportHeight, screenTop + (node.height | 0) + 2 * halfHeight + 1);
      for (let i = fillTop; i < fillBottom; ++i) {
        const textureRowOffset = i * viewportWidth;
        for (let j = fillLeft; j < fillRight; ++j) {
          occupancyTexture[textureRowOffset + j] = 1;
        }
      }
    }

    // Part 2: Read the texture looking for the closest available position to the cursor
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;
    const infiniteDistance = viewportWidth * viewportHeight + 1;
    let best = infiniteDistance;
    let bestX = 0;
    let bestY = 0;
    for (let y = 0; y < viewportHeight; ++y) {
      const textureRowOffset = y * viewportWidth;
      const yDist = y - centerY;
      const yDistSquared = yDist * yDist;
      for (let x = 0; x < viewportWidth; ++x) {
        if (occupancyTexture[textureRowOffset + x]) continue;
        const xDist = x - centerX;
        const dist = xDist * xDist + yDistSquared;
        if (dist >= best) continue;
        best = dist;
        bestX = x;
        bestY = y;
      }
    }

    console.timeEnd("modifyNodePosition");
    if (best === infiniteDistance) return null;
    return {x: bestX + viewportX - halfWidth, y: bestY + viewportY - halfHeight};
  }

  /**
   * Inserts a new node
   */
  addNode(position) {
    const { nodes } = this.#state;

    // Node interception fix
    position = this.modifyNodePosition(position);
    if (!position) {
      return false;
    }

    // Allocate everything
    const id = Counter.generateAutoincremented().toString();
    this.#forwardConnections[id] = [];
    this.#backwardConnections[id] = [];
    const newNode = createNodeObject(id, position.x, position.y, "ready");
    this.#nodeLabels[newNode.id] = newNode.data.label;
    this.#set({ nodes: [...nodes, newNode] }); // defaults to ready since new node is always ready with no dependencies
    return true;
  }

  /**
   * Removes a node
   */
  deleteNode(id) {
    const forwardConnections = this.#forwardConnections;
    const backwardConnections = this.#backwardConnections;

    // Unlink everything touching this
    for (const connection of backwardConnections[id]) {
      arrayRemoveByValueIfPresent(forwardConnections[connection], id);
    }
    for (const connection of forwardConnections[id]) {
      arrayRemoveByValueIfPresent(backwardConnections[connection], id);
    }

    backwardConnections[id].forEach(id => {
      this.updateNodeType(id)
    })

    // Then delete the containers for this vertex
    delete forwardConnections[id];
    delete backwardConnections[id];
    delete this.#nodeLabels[id];

    const { nodes, edges } = this.#state;
    this.#set({
      nodes: nodes.filter(node => node.id !== id),
      edges: edges.filter(edge => edge.source !== id && edge.target !== id),
    });
  }

  /**
   * Saves the position of the node
   */
  markNodePosition(id) {
    this.#set({
      nodes: this.#state.nodes.map(
        node => node.id !== id ? node : { ...node, data: { ...node.data, savedPosition: node.position } },
      )
    });
  }

  /**
   * Moves the node back to the saved position
   */
  restoreNodePosition(id) {
    this.#set({
      nodes: this.#state.nodes.map(node => {
        if (node.id !== id) return node;
        const { savedPosition } = node.data;
        return !savedPosition ? node : { ...node, position: savedPosition };
      }),
    });
  }

  /**
   * Connects or disconnects two nodes
   */
  connectOrDisconnect(srcId, dstId) {
    const forwardConnections = this.#forwardConnections;
    const backwardConnections = this.#backwardConnections;

    // Determine the types of the destination nodes for protecting root/goal from becoming a child node
    const dstNodeType = this.getNodeType(dstId);

    if (forwardConnections[dstId].includes(srcId)) { // Backward connection found
      const tmp = dstId;
      dstId = srcId;
      srcId = tmp;
    } else if (!forwardConnections[srcId].includes(dstId)) { // No connection found
      // Check for cycles
      const autoincremented = Counter.generateAutoincremented();
      const depthFirstSearch = {};

      function dfs(otherId) {
        // Use autoincremented as a visited boolean
        if (depthFirstSearch[otherId] === autoincremented) return;
        depthFirstSearch[otherId] = autoincremented;
        // An invariant, somewhat related to induction, is that
        // the graph does not previously contain cycles.
        // Therefore, any newly added cycle must involve the newly added
        // node, so we only need to check if that is involved in any loop
        for (const connection of forwardConnections[otherId]) {
          // Use exceptions to unwind quickly
          if (connection === srcId) throw new Error();
          dfs(connection);
        }
      }

      try {
        dfs(dstId);
      } catch (_) {
        // Cycle detected, don't add edge
        return;
      }

      if (dstNodeType === 'goal' ) {
        // Prevent forming forward connections if goal node is dstNode
        return;
      }

      forwardConnections[srcId].push(dstId);
      backwardConnections[dstId].push(srcId);
      this.#set({ edges: [...this.#state.edges, createEdgeObject(srcId, dstId, this.#nodeLabels[srcId], this.#nodeLabels[dstId])] });
      this.updateNodeType(srcId);
      this.updateQuestParents();
      return;
    } // else forward connection found, so will delete it
    const forward = forwardConnections[srcId];
    const backward = backwardConnections[dstId];
    forward.splice(forward.indexOf(dstId), 1);
    backward.splice(backward.indexOf(srcId), 1);

    this.#set({
      edges: this.#state.edges.filter(
        edge => edge.source !== srcId || edge.target !== dstId,
      ),
    });
    this.updateNodeType(srcId)
	this.updateQuestParents();
  }

  /**
   * Updates the type of the node based on the connected nodes.
   */
  updateNodeType(id) {

    const forwardConnections = this.#forwardConnections[id];
    var allComplete = true;

    if (this.getNode(id).type === "goal") {
      return;
    }

    if (forwardConnections.length === 0) {
      this.setNodeType(id, "ready")
    }

    for (var i = 0; i < forwardConnections.length; i++) {
      const node = this.getNode(forwardConnections[i])

      if (node.type !== "complete") {
        allComplete = false;
      }

      if (node.type === "ready") {
        this.setNodeType(id, "locked")
        return;
      }
    }

    if (allComplete) {
      this.setNodeType(id, "ready")
    }

  }

  setNodeCompleted(id, completed) {
    const backwardConnections = this.#backwardConnections[id]

    this.setNodeType(id, completed ? "complete" : "ready");

    backwardConnections.forEach(id => {
      this.updateNodeType(id)
    })
	this.updateQuest();
  }

  /**
   * Returns the display name for a node
   */
  getNodeLabel(id) {
    runtime_assert(id in this.#nodeLabels);
    return this.#nodeLabels[id];
  }

  /**
   * Changes the display name for a node
   */
  setNodeLabel(id, name) {
    const nodeLabels = this.#nodeLabels;
    nodeLabels[id] = name;
    this.#set({
      nodes: this.#state.nodes.map(
        node => node.id !== id ? node : { ...node, data: { ...node.data, label: name } },
      ),
      edges: this.#state.edges.map(edge => {
        const { source, target } = edge;
        switch (id) {
          case source:
            return createEdgeObject(id, target, name, nodeLabels[target]);
          case target:
            return createEdgeObject(source, id, nodeLabels[source], name);
          default:
            return edge;
        }
      }),
    });
  }

  highlightOrUnhighlightNode(target) {
    if (target === null) { // if no target, unhighlight all nodes
      for (const node of this.#state.nodes) {
        document.querySelector(`[data-id="${node.id}"]`).style.border = "1px solid rgba(105, 105, 105, 0.7)";
      }
    } else {
      for (const node of this.#state.nodes) { // highlight target and unhighlight all other nodes
        if (node.id !== target.id){
          document.querySelector(`[data-id="${node.id}"]`).style.border = "1px solid rgba(105, 105, 105, 0.7)";
        } else {
          document.querySelector(`[data-id="${target.id}"]`).style.border = "2px solid rgba(105, 105, 105, 0.7)";
        }
      }
    }
  }

  getNodeType(id) {
    for (const node of this.#state.nodes) {
      if (node.id === id) {
        return node.type;
      }
    }
    throw new Error();
  }

  /**
   * Changes node type
   */
  setNodeType(id, type) {
    this.#set({
      nodes: this.#state.nodes.map(
        node => node.id !== id ? node : {... node, type: type},
      ),
    });
  }

  /**
   * Gets relative position of a node
   */
  getNodeAbsolutePos(id) {
    for (const node of this.#state.nodes) {
      if (node.id === id) {
        return { x: node.position.x, y: node.position.y }
      }
    }
    throw new Error();
  }

  /**
   * Gets specified node by id
   */
  getNode(id) {
    for (const node of this.#state.nodes) {
      if (node.id === id) {
        return node;
      }
    }
    throw new Error();
  }

  /**
   * Returns the graph name
   */
  getGraphName() {
    return this.#graphName;
  }

  /**
   * Returns if the node has a subgraph.
   */
  isNodeSubgraph(id) {
    for (const node of this.#state.nodes) {
      if (node.id === id) {
        return !!node.subgraph;
      }
    }
    return false; // throw new Error(); // TODO
  }

  /**
   * Gets current task list.
   */
  getCurrentTasks() {
	return this.#currentTasks;
  }

  /**
   * Gets current questline parent node.
   */
  getCurrentQuestline(){
	return this.#currentQuestline;
  }

  /**
   * Sets current questline by id
   */
  setCurrentQuestline(questlineId) {
	this.#currentQuestline = this.#questParents.filter((node) => node.id == questlineId);
	this.updateQuestParents();
  }

  /**
   * Gets all available quests.
   */
  getAllQuests() {
	return this.#questParents;
  }

  /**
   * 
   */

  /**
   * Renders to HTML and opens a popup to print.
   */
  export(edgesSvg) {
    /*
     * The user is prompted to print a popup. This can be to paper, to PDF, or in some browsers (Epiphany) to PostScript or SVG.
     * Open the PDF with Inkscape to convert to SVG.
     * Cancelling to save the HTML is also supported. It is standalone except for loading the font.
     * The previous code using a library generated MiB-sized files and didn't render the icons.
     * The current code targets 10KiB files.
     * The icons now render perfectly in-browser, but are blurry when printed. This is a limitation of current browsers but isn't that bad.
     */

    let left = 0;
    let right = 0;
    let top = 0;
    const { nodes } = this.#state;
    const exactWidth = dimensions.width;
    for (const node of nodes) {
      const { x, y } = node.position;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x + exactWidth);
    }
    const positionOffset = { x: -left, y: -top };

    const safeWidth = 670; // https://stackoverflow.com/a/11084797/10477326
    const printer = window.open("", "", `width=${safeWidth},height=${safeWidth}`);
    const doc = printer.document;
    const { head, body } = doc;

    const style = doc.createElement("style");
    head.append(style);
    style.append(doc.createTextNode([...document.styleSheets].flatMap(x => [...x.cssRules].map(x => {
      if (x instanceof CSSImportRule) return x.cssText;
      if (!(x instanceof CSSStyleRule) ||
        !/body|div\.react-flow__node(?!\w|:hover)|react-flow__edge-path|seamless-editor/.test(x.selectorText)) return "";
      return x.cssText;
    })).join("")));

    const main = doc.createElement("main");
    main.style.position = "absolute";
    main.style.transform = `scale(${safeWidth / (right - left)})`;
    body.append(main);
    body.style.overflow = "hidden";

    const root = createRoot(main);
    flushSync(() => {
      root.render(<>
        {nodes.map(x => {
          return <Node key={x.id} {...x} exporting positionOffset={positionOffset} />;
        })}
      </>)
    });

    const edgesSvgImport = doc.importNode(edgesSvg, true);
    edgesSvgImport.setAttribute("width", 0); // Prevent affecting size
    edgesSvgImport.setAttribute("height", 0);
    edgesSvgImport.style.position = "absolute";
    edgesSvgImport.style.transform = `translate(${positionOffset.x}px, ${positionOffset.y}px)`;
    edgesSvgImport.style.overflow = "visible";
    main.prepend(edgesSvgImport); // Disable hover by appending on top over nodes

    printer.print();
    // Leave popup open so it can be saved to HTML
  }

  checkContainsMUI(classList) {
    if (classList === undefined) {
      return false;
    }

    for (let i = 0; i < classList.length; i++) {
      if (classList[i].startsWith("Mui")) {
        return true;
      }
    }
    return false;
  }

  createSubgraphAndSaveIfNotExists(uid, id) {
    let result = "";
    let created = false;
    this.#set({
      nodes: this.#state.nodes.map(
        node => {
          if (node.id !== id) return node;
          if (result) throw new Error();
          let { subgraph } = node;
          if (!subgraph) {
            subgraph = new Date().getTime().toString();
            created = true;
          }
          result = subgraph;
          return {...node, subgraph: result};
        }
      ),
    });
    if (!result) throw new Error();
    if (created) {
      this.save(uid, () => {});
    }
    return result;
  }
}

const useGraphLayerViewerStore = () => create((set, get) => ({ // TODO
  nodes: [],
  edges: [],
  /**
   * Set to a new value on load. This is used as passing a callback to load() runs too early.
   */
  loadAutoincremented: Counter.generateAutoincremented,
  /**
   * The actual operations
   */
  operations: new GraphLayerViewerOperations(set, get),
  /**
   * The node being edited
   */
  editingNodeId: "",
  editingNodeInitialValue: "",
  editNode(id, initialValue) {
    set({...get(), editingNodeId: id, editingNodeInitialValue: initialValue})
  },
}));

export default useGraphLayerViewerStore;
