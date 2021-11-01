export interface ISerializedNode {
  /**
   * Unique ID for each workflow
   */
  readonly id: string;

  /**
   * Hardcoded type in the node meta
   */
  readonly type: string;

  /**
   * Display position, only relevant for the drawboard
   */
  position: [number, number];

  /**
   * Optional node configuration
   */
  config?: object | unknown;
}
