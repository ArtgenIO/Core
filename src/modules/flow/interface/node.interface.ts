export interface INode {
  /**
   * Unique ID for each flow
   */
  readonly id: string;

  /**
   * Hardcoded type in the node meta
   */
  readonly type: string;

  /**
   * Display position, only relevant for the artboard
   */
  position: [number, number];

  /**
   * Optional node configuration
   */
  config?: object | unknown;

  /**
   * Human friendly name
   */
  title: string;
}
