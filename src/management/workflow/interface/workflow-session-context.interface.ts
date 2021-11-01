export interface IWorkflowSessionContext {
  /**
   * Node input / output data through the execution chain
   */
  $nodes: {
    [nodeId: string]: {
      config: unknown;
      input: {
        [handleId: string]: unknown;
      };
      output: {
        [handleId: string]: unknown;
      };
    };
  };

  /**
   * Input trigger data, used by the trigger to start the flow
   */
  $trigger: unknown;

  /**
   * Current output data for nodes after it's been executed
   */
  $output: {
    [handleId: string]: unknown;
  };

  /**
   * Current input data for nodes when being executed
   */
  $input: {
    [handleId: string]: unknown;
  };
}
