import { Node } from 'react-flow-renderer';

export interface CustomNodeData {
  /**
   * Human friendly name for a node.
   */
  label: string;

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
