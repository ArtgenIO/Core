import { IDashGridElement } from './dash-grid.interface';

export interface IDashboard {
  id: string;
  name: string;
  widgets: IDashGridElement[];
}
