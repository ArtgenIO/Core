export interface INode {
  /**
   * Unique ID for each workflow
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
  label: string;
}