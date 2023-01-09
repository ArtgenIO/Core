import { ILambda } from './lambda.interface';
import { ILambdaMeta } from './meta.interface';

/**
 * Used in the lambada registry to manage lookups and record like iterations
 */
export interface ILambdaRecord {
  /**
   * Read from the @Lambda decorator
   */
  meta: ILambdaMeta;

  /**
   * Instance to execute a request, must be stateless
   */
  handler: ILambda;
}
