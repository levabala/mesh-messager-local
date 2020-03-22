import { Node } from 'mesh-messager-core';

import { addNode, communicationLocal, connectedNodes, joinNode, kickSomeone } from './communicationLocal';

function pickRandom<T>(arr: Array<T>): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const rootNode = new Node(communicationLocal).setLogging(false);

async function addSomeNode() {
  const n = new Node(communicationLocal).setLogging(false);
  const p = joinNode(n, pickRandom(Object.values(connectedNodes)));

  // console.log(`add ${Node.shortId(n.id)}`);

  await p;
  n.startLifecycle();
}

(async () => {
  addNode(rootNode);

  await Promise.all(new Array(60).fill(null).map(() => addSomeNode()));

  console.log("firstly connectedNodes:", Object.keys(connectedNodes).length);

  // Object.values(connectedNodes).forEach(n => console.log(n.toString()));

  setInterval(() => {
    if (Math.random() > 0.5) addSomeNode();
  }, 2000);

  setTimeout(
    () =>
      setInterval(() => {
        if (Math.random() > 0.5) kickSomeone();
      }, 2000),
    2000
  );

  setInterval(() => {
    console.clear();
    console.log("\n----");
    Object.values(connectedNodes).forEach(n => console.log(n.toString()));
    console.log("----\n");

    // console.log(Object.values(connectedNodes)[0]);
    console.log(Object.values(connectedNodes)[0].toString());
    console.log(
      Object.values(connectedNodes)[0]
        .fingers.map(({ key, nodeId }) => `${key}: ${Node.shortId(nodeId)}`)
        .join("\n")
    );
  }, 100);
})();
