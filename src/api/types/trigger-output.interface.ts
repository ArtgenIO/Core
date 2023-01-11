import { RowLike } from './row-like.interface';

export interface ITriggerOutput {
  meta: RowLike | any;
  data: unknown;
}
