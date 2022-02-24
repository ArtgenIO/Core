import { IFlowSessionContext } from '.';

export interface ICapturedContext {
  id: string;
  flowId: string;
  elapsedTime: number;
  context: IFlowSessionContext;
  debugTrace: [string, number][];
  createdAt: Date | string;
}
