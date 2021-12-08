import { FieldTag } from './field-tags.enum';
import { FieldType } from './field-type.enum';

type TypeParams = {
  binary?: boolean;
  length?: number | 'tiny' | 'medium' | 'long';
  zerofill?: boolean;
  unsigned?: boolean;
  decimals?: number;
  scale?: number;
  precision?: number;
  values: string[];
};

export interface IField {
  /**
   * Unique readonly reference to track the schema even if the column name changed.
   * This is the default mapping when the data is read from the database.
   */
  readonly reference: string;

  /**
   * Human readable title.
   */
  title: string;

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
