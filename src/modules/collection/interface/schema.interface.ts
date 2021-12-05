import { IField } from './field.interface';
import { IRelation } from './relation.interface';

export interface ICollection {
  /**
   * Migration tracker, to ensure compability.
   * Everytime a schema is loaded the system executes the migrations
   * until it's changed and being saved as a newer version.
   *
   * @since V2
   */
  version: number;

  /**
   * Data abstraction driver.
   *
   * @since V2
   */
  //abstraction: 'collection' | 'singleton' | 'set';

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
   * Readonly databases where we only fetch data, this is garanteed on the
   * CRUD manager level.
   */
  permission: 'rw' | 'r';

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
