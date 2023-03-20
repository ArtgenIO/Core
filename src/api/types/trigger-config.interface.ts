export type ITriggerConfig = {
  /**
   * Content type or format for the response
   */
  responseFormat: string;

  /**
   * Content or a template for the content
   */
  response: string;

  /**
   * Async the request, or wait for the results.
   * Must wait for the result to extract response template references.
   */
  waitForLastNode: boolean;
};
