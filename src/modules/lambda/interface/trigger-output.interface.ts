import { RowLike } from '../../../app/interface/row-like.interface';

export interface ITriggerOutput {
  meta: RowLike | any;
  data: unknown;
}
