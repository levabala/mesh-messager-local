import { Communication, Node, RequestType } from 'mesh-messager-core';

export const connectedNodes: Record<string, Node> = {};

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

export function kickSomeone() {
  const keys = Object.keys(connectedNodes);
  if (!keys.length) return;

  const index = Math.floor(Math.random() * keys.length);

  // console.log(`kick ${Node.shortId(keys[index])}`);

  const node = connectedNodes[keys[index]];
  node.stopLifecycle();
  delete connectedNodes[keys[index]];
}
