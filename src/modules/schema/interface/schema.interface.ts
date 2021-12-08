import { IField } from './field.interface';
import { IRelation } from './relation.interface';

export interface ISchema {
  /**
   * Display icon, used to help differentiate the schema in a list.
   *
   * @since V2
   */
  icon: string;

  /**
   * Unique name used to identify a data source as a model.
   * Does not change even if the table is renamed, it's saved in the meta.
   */
  reference: string;

  /**
   * Database ID
   */
  database: string;

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
   * Behavior tags.
   */
  tags: string[];

  /**
   * Table column mappings.
   */
  fields: IField[];

  indices: { name: string; fields: string[] }[];
  uniques: { name: string; fields: string[] }[];

  /**
   * Associations / relations between models.
   */
  relations: IRelation[];

  /**
   * ArtBoard meta data.
   */
  artboard: {
    position: {
      x: number;
      y: number;
    };
  };
}
