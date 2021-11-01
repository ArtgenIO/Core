import { ISerializedEdge } from './serialized-edge.interface';
import { ISerializedNode } from './serialized-node.interface';

export interface IWorkflow {
  /**
   * UUID generated when initialized
   */
  readonly id: string;

  /**
   * Human readable display name
   */
  name: string;

  /**
   * Contained nodes
   */
  nodes: ISerializedNode[];

  /**
   * Edges between nodes
   */
  edges: ISerializedEdge[];
}
