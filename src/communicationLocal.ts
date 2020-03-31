import { Communication, Node, RequestType } from 'mesh-messager-core';

function pickRandom<T>(arr: Array<T>): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const connectedNodes: Record<string, Node> = {};

export function getConnectivityComponent(nodeIdRaw: bigint) {
  const nodeId = nodeIdRaw.toString();
  const usedNodes = [nodeId];

  let node = connectedNodes[nodeId];
  let component = 1;

  while (!usedNodes.includes(node.successor.toString())) {
    node = connectedNodes[node.successor.toString()];
    if (!node) return component;

    component++;

    usedNodes.push(node.id.toString());
  }

  return component;
}

export const communicationLocal: Communication = {
  [RequestType.FindSuccessorForId]: async (req, tar, { key }) => {
    if (!connectedNodes[tar.toString()]) throw new Error("the node is offline");

    const succ = await connectedNodes[tar.toString()].findSuccessorForKey(key);
    return { id: succ };
  },
  [RequestType.GetStorageValue]: async (req, tar, { key }) => {
    if (!connectedNodes[tar.toString()]) throw new Error("the node is offline");

    return { value: connectedNodes[tar.toString()].storage[key] };
  },
  [RequestType.GetSuccessorId]: async (req, tar) => {
    if (!connectedNodes[tar.toString()]) throw new Error("the node is offline");

    return { id: connectedNodes[tar.toString()].successor };
  },
  [RequestType.GetPredecessor]: async (req, tar) => {
    if (!connectedNodes[tar.toString()]) throw new Error("the node is offline");

    return { id: connectedNodes[tar.toString()].predecessor };
  },
  [RequestType.Notify]: async (req, tar, { key }) => {
    if (!connectedNodes[tar.toString()]) throw new Error("the node is offline");

    connectedNodes[tar.toString()].notify(key);
    return {};
  },
  [RequestType.Ping]: async (req, tar) => {
    if (!connectedNodes[tar.toString()]) throw new Error("the node is offline");

    return { id: connectedNodes[tar.toString()].successor };
  },
  [RequestType.GetSuccessorsList]: async (req, tar) => {
    if (!connectedNodes[tar.toString()]) throw new Error("the node is offline");

    return { list: connectedNodes[tar.toString()].successorList };
  }
};

export function addNode(node: Node) {
  connectedNodes[node.id.toString()] = node;
}

export async function joinNode(node: Node, nodeToJoin: Node) {
  // console.log(
  //   `join ${Node.shortId(node.id)} to ${Node.shortId(nodeToJoin.id)}`
  // );
  addNode(node);
  await node.joinNode(nodeToJoin.id);
}

export function kickSomeone(lowest = false) {
  const nodes = Object.values(connectedNodes);

  let nodeToRemove;

  if (lowest) {
    const lowestConnectivity = nodes.reduce(
      (acc, val) => Math.min(getConnectivityComponent(val.id), acc),
      Infinity
    );
    const lowestNodes = nodes.filter(
      node => getConnectivityComponent(node.id) === lowestConnectivity
    );

    nodeToRemove = pickRandom(lowestNodes);
  } else nodeToRemove = pickRandom(nodes);

  nodeToRemove.stopLifecycle();
  delete connectedNodes[nodeToRemove.id.toString()];
}

export async function addSomeNode(highest = false) {
  const n = new Node(communicationLocal).setLogging(false);
  const nodes = Object.values(connectedNodes);

  let nodeToJoin;
  if (highest) {
    const highestConnectivity = nodes.reduce(
      (acc, val) => Math.max(getConnectivityComponent(val.id), acc),
      0
    );
    const highestNodes = nodes.filter(
      node => getConnectivityComponent(node.id) === highestConnectivity
    );

    nodeToJoin = pickRandom(highestNodes);
  } else nodeToJoin = pickRandom(nodes);

  const p = joinNode(n, nodeToJoin);
  await p;

  // console.log(
  //   `${n.id} joins to ${nodeToJoin.id} with component == ${highestConnectivity}`
  // );

  return n;
}
