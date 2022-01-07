import { createLogger } from 'winston';
import { ILambda } from '../../lambda/interface/lambda.interface';
import { LambdaService } from '../../lambda/service/lambda.service';
import { IWorkflowSessionContext } from '../interface';
import { ILogic } from '../interface/workflow.interface';
import { WorkflowSession } from './workflow.session';

const createLambdaService = (lambdas: ILambda[]) => {
  return new LambdaService(createLogger(), lambdas);
};

describe('WorkflowSession', () => {
  test('should construct', () => {
    const testWf: ILogic = {
      id: 'testid',
      name: 'testname',
      nodes: [],
      edges: [],
    };
    const lambda = createLambdaService([]);
    const sessionId = 'testid';
    const session = new WorkflowSession(
      createLogger(),
      lambda,
      testWf,
      sessionId,
    );

    expect(session.id).toBe('testid');
    expect(session.workflow).toBe(testWf);
    expect(session.getContext()).toStrictEqual({
      $nodes: {},
      $trigger: {},
      $output: {},
      $input: {},
      $final: null,
    } as IWorkflowSessionContext);
  });
});
