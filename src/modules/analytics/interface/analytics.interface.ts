import { IAxis } from './axis.interface';

export interface IAnalytics {
  id: string;

  label: string;

  type: 'counter' | 'line' | 'bar';

  axes: IAxis[];
}
