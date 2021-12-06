import { ILogic } from '../../flow/interface/workflow.interface';
import { WorkflowSession } from '../../flow/library/workflow.session';

/**
 * Request executor, must be stateless so each invoking can be called without reinitialization
 */
export interface ILambda {
  /**
   * Lambda is being loaded with a serialized workflow.
   */
  onInit?(workflow: ILogic): Promise<void>;

  /**
   * Lambda is executed in a workflow session.
   */
  invoke(ctx: WorkflowSession): Promise<{ [handleId: string]: unknown } | void>;
}
