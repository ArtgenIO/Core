export interface ISerializedNodeHandle {
  /**
   * Reference used for edges
   */
  readonly id: string;

  /**
   * Only outputs can be connected to inputs.
   */
  readonly type: 'input' | 'output';
}
