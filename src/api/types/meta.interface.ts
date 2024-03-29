import { JSONSchema7Definition } from 'json-schema';
import { ILambdaHandle } from './lambda-handle.interface';

export interface ILambdaMeta {
  /**
   * Primary key used to register and manage lambdas in flows
   */
  type: string;

  /**
   * Handles defined on the node, edges can connect to them
   */
  handles: ILambdaHandle[];

  /**
   * Expected node configuration
   */
  config?: JSONSchema7Definition;

  /**
   * Artboard icon
   */
  icon?: string;

  /**
   * Artboard description
   */
  description: string;
}
