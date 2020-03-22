import { Node } from 'mesh-messager-core';

import { addNode, communicationLocal, joinNode } from './communicationLocal';

function pickRandom<T>(arr: Array<T>): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const rootNode = new Node(communicationLocal);

const nodes = new Array(30).fill(null).map(() => new Node(communicationLocal));
const connectedNodes = [rootNode];

(async () => {
  addNode(rootNode);

  await Promise.all(
    nodes.map(async (n, i) => {
      const p = joinNode(n, pickRandom(connectedNodes));
      connectedNodes.push(n);

      return p;
    })
  );

  console.log("connectedNodes:", connectedNodes.length);

  nodes.forEach(n => console.log(n.toString()));
  nodes.forEach(n => n.startLifecycle());

  setInterval(() => {
    console.log("\n----");
    nodes.forEach(n => console.log(n.toString()));
  }, 5000);
})();
