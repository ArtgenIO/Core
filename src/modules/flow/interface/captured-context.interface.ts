import { IFlowSessionContext } from '.';

export interface ICapturedContext {
  id: string;
  flowId: string;
  elapsedTime: number;
  context: IFlowSessionContext;
  createdAt: Date | string;
}
