import { RowLike } from './row-like.interface';

export interface IFindResponse<R = RowLike> {
  meta: {
    total: number;
    count: number;
  };
  data: R[];
}
