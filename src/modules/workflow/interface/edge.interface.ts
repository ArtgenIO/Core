export interface IEdge {
  /**
   * Auto generated UUID
   */
  readonly id: string;

  /**
   * Source node's ID
   */
  sourceNodeId: string;

  /**
   * Target node's ID
   */
  targetNodeId: string;

  /**
   * Source node's handle
   */
  sourceHandle: string;

  /**
   * Target node's handle
   */
  targetHandle: string;

  /**
   * Transformation template
   */
  transform?: string;
}
