import { IDashGridElement } from '../api/types/dash-grid.interface';

export interface IDashboard {
  id: string;
  name: string;
  order: number;
  widgets: IDashGridElement[];
}
