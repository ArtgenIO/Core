import { createLogger } from 'winston';
import { ILambda } from '../../lambda/interface/lambda.interface';
import { LambdaService } from '../../lambda/service/lambda.service';
import { IFlowSessionContext } from '../interface';
import { IFlow } from '../interface/flow.interface';
import { FlowSession } from './flow.session';

const createLambdaService = (lambdas: ILambda[]) => {
  return new LambdaService(createLogger(), lambdas);
};

describe(FlowSession.name, () => {
  test('should construct', () => {
    const testWf: IFlow = {
      id: 'testid',
      name: 'testname',
      nodes: [],
      edges: [],
    };
    const lambda = createLambdaService([]);
    const sessionId = 'testid';
    const session = new FlowSession(createLogger(), lambda, testWf, sessionId);

    expect(session.id).toBe('testid');
    expect(session.flow).toBe(testWf);
    expect(session.getContext()).toStrictEqual({
      $nodes: {},
      $trigger: {},
      $output: {},
      $input: {},
      $final: null,
    } as IFlowSessionContext);
  });
});
