import { IFlowSessionContext } from '../api/types/flow-session-context.interface';

export interface ICapturedContext {
  id: string;
  flowId: string;
  elapsedTime: number;
  context: IFlowSessionContext;
  debugTrace: [string, number][];
  createdAt: Date | string;
}
