import { Node } from 'mesh-messager-core';
import readline from 'readline';

import {
  addNode,
  addSomeNode,
  communicationLocal,
  connectedNodes,
  getConnectivityComponent,
  kickSomeone,
} from './communicationLocal';

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

let index = 0;
process.stdin.on("keypress", (str, key) => {
  switch (key.name) {
    case "left":
      index--;
      break;
    case "right":
      index++;
      break;
    case "q":
      process.exit();
      break;
  }
});

const rootNode = new Node(communicationLocal).setLogging(false);

(async () => {
  addNode(rootNode);

  const delay = 10;
  await Promise.all(
    new Array(40).fill(null).map(async (_, i) => {
      await new Promise(res => setTimeout(() => res(), delay * i));
      addSomeNode();
    })
  );

  Object.values(connectedNodes).map(node => node.startLifecycle());

  console.log("firstly connectedNodes:", Object.keys(connectedNodes).length);

  // Object.values(connectedNodes).forEach(n => console.log(n.toString()));

  const changeInterval = 200;
  setInterval(() => {
    if (Math.random() > 0.5) addSomeNode();
  }, changeInterval);

  setTimeout(
    () =>
      setInterval(() => {
        if (Math.random() > 0.5) kickSomeone();
      }, changeInterval),
    1000
  );

  setInterval(() => {
    console.clear();
    console.log("\n----");
    Object.values(connectedNodes).forEach(n =>
      console.log(
        `${n.toString()}\t${"component: " + getConnectivityComponent(n.id)}`
      )
    );
    console.log("----\n");

    const node = Object.values(connectedNodes)[index];
    if (!node) return;

    // console.log(Object.values(connectedNodes)[0]);
    console.log(node.toString());
    console.log(
      node.fingers
        .map(({ key, nodeId }) => `${key}: ${Node.shortId(nodeId)}`)
        .join("\n")
    );
  }, 100);
})();
