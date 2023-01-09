import { FlowSession } from '../library/flow.session';
import { IFlow } from './flow.interface';

/**
 * Request executor, must be stateless so each invoking can be called without reinitialization
 */
export interface ILambda {
  /**
   * Lambda is being loaded with a serialized flow.
   */
  onInit?(flow: IFlow): Promise<void>;

  /**
   * Lambda is executed in a flow session.
   */
  invoke(ctx: FlowSession): Promise<{ [handleId: string]: unknown } | void>;
}
