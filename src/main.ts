import { Node } from 'mesh-messager-core';

import { addNode, communicationLocal, joinNode } from './communicationLocal';

const n1 = new Node(communicationLocal);
const n2 = new Node(communicationLocal);
const n3 = new Node(communicationLocal);

addNode(n1);
joinNode(n2, n1);
joinNode(n3, n2);
