export interface INodeHandle {
  /**
   * Reference used for edges
   */
  readonly id: string;

  /**
   * Only outputs can be connected to inputs.
   */
  readonly type: 'input' | 'output';
}
