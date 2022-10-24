import { RowLike } from '../../../app/interface/row-like.interface.js';

export interface IDashGridElement {
  // ID
  i: string;

  // Stored state for widgets.
  widget: {
    id: string;
    header: string;
    config?: RowLike;
  };

  // Width
  w: number;
  minW?: number;
  maxW?: number;

  // Height
  h: number;
  minH?: number;
  maxH?: number;

  // Position X
  x: number;
  // Position Y
  y: number;

  // Static lock
  static?: boolean;
}
