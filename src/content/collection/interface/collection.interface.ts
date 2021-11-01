import { IField } from './column.interface';

export interface ICollection {
  /**
   * Unique name used to identify a data source as a model.
   * Does not change even if the table is renamed, it's saved in the meta.
   */
  readonly reference: string;

  /**
   * Used in UI and other settings, where the data is displayed.
   * Human friendly apperence.
   */
  label: string;

  /**
   * Real table name in the database.
   */
  tableName: string;

  /**
   * Real schema name in the database. (Postgres)
   */
  schema: string | null;

  /**
   * Behavior tags.
   */
  readonly tags: string[];

  /**
   * Table column mappings.
   */
  readonly fields: IField[];
}
