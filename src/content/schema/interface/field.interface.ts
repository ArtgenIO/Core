import { TextLength } from 'sequelize/types';
import { FieldTag } from './field-tags.enum';
import { FieldType } from './field-type.enum';

type TypeParams = {
  binary?: boolean;
  length?: number | TextLength;
  zerofill?: boolean;
  unsigned?: boolean;
  decimals?: number;
  scale?: number;
  precision?: number;
  values: string[];
};

export interface IField {
  /**
   * Unique name used to identify a data column.
   * Does not change even if the column is renamed, it's saved in the meta.
   */
  readonly reference: string;

  /**
   * Used in UI and other settings, where the data is displayed.
   * Human friendly apperence.
   */
  label: string;

  /**
   * Real column name in the database.
   */
  columnName: string;

  /**
   * Default value on create or alter.
   */
  defaultValue?: string | number | null | boolean | [] | object;

  /**
   * Intersected local type.
   */
  type: FieldType;

  /**
   * Type parameters
   */
  typeParams: TypeParams;

  /**
   * Behavior tags.
   */
  readonly tags: FieldTag[];
}
