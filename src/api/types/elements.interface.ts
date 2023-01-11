import { Edge, Node } from 'reactflow';

type NodeOrEdge<T> = Node<T> | Edge<T>;
export type Elements<T = any> = NodeOrEdge<T>[];
