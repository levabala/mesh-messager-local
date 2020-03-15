import { Communication, Node, RequestType } from 'mesh-messager-core';

const nodes: Record<string, Node> = {};

export const communicationLocal: Communication = {
  [RequestType.FindSuccessorForId]: async (req, tar, { key }) => {
    const succ = await nodes[tar.toString()].findSuccessorForKey(key);
    return { id: succ };
  },
  [RequestType.GetStorageValue]: async (req, tar, { key }) => {
    return { value: nodes[tar.toString()].storage[key] };
  },
  [RequestType.GetSuccessorId]: async (req, tar) => {
    return { id: nodes[tar.toString()].successor };
  }
};

export function addNode(node: Node) {
  nodes[node.id.toString()] = node;
}

export function joinNode(node: Node, nodeToJoin: Node) {
  addNode(node);
  node.joinNode(nodeToJoin.id);
}
