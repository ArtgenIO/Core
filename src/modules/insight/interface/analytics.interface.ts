import { IAxis } from './axis.interface';

export interface IAnalytics {
  id: string;

  title: string;

  type: 'counter' | 'line' | 'bar';

  axes: IAxis[];
}
