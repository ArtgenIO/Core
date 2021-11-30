export interface IAxis {
  position: 'x' | 'y';
  filter: string;
  aggregation: 'none' | 'sum' | 'avg' | 'max' | 'min';
}
