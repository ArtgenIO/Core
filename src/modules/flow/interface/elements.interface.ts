import { Edge, Node } from 'react-flow-renderer';

type NodeOrEdge<T> = Node<T> | Edge<T>;
export type Elements<T = any> = NodeOrEdge<T>[];
