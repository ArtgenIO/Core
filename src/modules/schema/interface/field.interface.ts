import { FieldTag } from './field-tags.enum';
import { FieldType } from './field-type.enum';
import { IGetter, ISetter } from './setter-getter.interface';

type FieldArgs = {
  binary?: boolean;
  length?: number | 'tiny' | 'medium' | 'long';
  zerofill?: boolean;
  unsigned?: boolean;
  decimals?: number;
  scale?: number;
  precision?: number;
  values?: string[];
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
   * Visual infor
   */
  meta: {
    grid?: {
      order: number;
      hidden: boolean;
    };
  };

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
   * Type args
   */
  args: FieldArgs;

  /**
   * Value setters
   */
  setters?: ISetter[];

  /**
   * Value setters
   */
  getters?: IGetter[];

  /**
   * Behavior tags.
   */
  readonly tags: FieldTag[];
}
