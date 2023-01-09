import { Dispatch, SetStateAction } from 'react';
import { RowLike } from './row-like.interface.js';

export type IBaseWidgetProps<C = RowLike> = {
  id: string;
  header?: string;
  config?: C;

  openConfig: boolean;
  setOpenConfig: Dispatch<SetStateAction<boolean>>;
};
