import EventEmitter2 from 'eventemitter2';
import { FlowSession } from '../../src/api/library/flow.session';
import { LambdaService } from '../../src/api/services/lambda.service';
import { IFlowSessionContext } from '../../src/api/types/flow-session-context.interface';
import { IFlow } from '../../src/api/types/flow.interface';
import { ILambda } from '../../src/api/types/lambda.interface';

const createLambdaService = (lambdas: ILambda[]) => {
  return new LambdaService({} as any, lambdas);
};

describe(FlowSession.name, () => {
  test('should construct', () => {
    const testWf: IFlow = {
      id: 'testid',
      name: 'testname',
      nodes: [],
      edges: [],
      captureContext: false,
      isActive: true,
    };
    const lambda = createLambdaService([]);
    const sessionId = 'testid';
    const session = new FlowSession(
      {} as any,
      lambda,
      new EventEmitter2(),
      testWf,
      sessionId,
    );

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
