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
  },
  [RequestType.GetPredecessor]: async (req, tar) => {
    return { id: nodes[tar.toString()].predecessor };
  },
  [RequestType.Notify]: async (req, tar, { key }) => {
    nodes[tar.toString()].notify(key);
    return {};
  },
  [RequestType.Ping]: async (req, tar) => {
    if (!nodes[tar.toString()]) throw new Error("the node is offline");

    return { id: nodes[tar.toString()].successor };
  }
};

export function addNode(node: Node) {
  nodes[node.id.toString()] = node;
}

export async function joinNode(node: Node, nodeToJoin: Node) {
  console.log(
    `join ${Node.shortId(node.id)} to ${Node.shortId(nodeToJoin.id)}`
  );
  addNode(node);
  await node.joinNode(nodeToJoin.id);
}
