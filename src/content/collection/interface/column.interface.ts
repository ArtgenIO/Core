import { ColumnType } from 'typeorm';

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
   * Real coloumn name in the database.
   */
  columnName: string;

  /**
   * Default value on create or alter.
   */
  defaultValue: string | number | null | boolean | [] | object;

  /**
   * Intersected local type.
   */
  type: ColumnType;

  /**
   * Behavior tags.
   */
  readonly tags: string[];
}
