import { Node } from 'reactflow';

export interface CustomNodeData {
  /**
   * Human friendly name for a node.
   */
  title: string;

  /**
   * Original lambda type, for deserialization.
   */
  type: string;

  /**
   * Custom config
   */
  config: unknown;
}

export type CustomNode = Node<CustomNodeData>;
