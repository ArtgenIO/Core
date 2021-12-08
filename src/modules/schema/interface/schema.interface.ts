import { IField } from './field.interface';
import { IRelation } from './relation.interface';

export interface ISchema {
  /**
   * Human readable title.
   */
  title: string;

  /**
   * Name of the database where it stored.
   */
  database: string;

  /**
   * Unique reference for programatic identification.
   */
  reference: string;

  /**
   * Table's name in the database.
   */
  tableName: string;

  /**
   * Table's column mappings.
   */
  fields: IField[];

  /**
   * Compositive table indices.
   */
  indices: { name: string; fields: string[] }[];

  /**
   * Compositive table unique indices.
   */
  uniques: { name: string; fields: string[] }[];

  /**
   * Relation mappings.
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

  /**
   * Behavior tags.
   */
  tags: string[];
}
