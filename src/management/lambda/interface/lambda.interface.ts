import { IWorkflow } from '../../workflow/interface/workflow.interface';
import { WorkflowSession } from '../../workflow/library/workflow.session';

/**
 * Request executor, must be stateless so each invoking can be called without reinitialization
 */
export interface ILambda {
  /**
   * Lambda is being loaded with a serialized workflow.
   */
  onInit?(workflow: IWorkflow): Promise<void>;

  /**
   * Lambda is executed in a workflow session.
   */
  invoke(ctx: WorkflowSession): Promise<{ [handleId: string]: unknown } | void>;
}
