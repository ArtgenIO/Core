import { IField } from '../api/types/field.interface';
import { IRelation } from '../api/types/relation.interface';

export interface ISchema {
  moduleId?: string;

  /**
   * Non esential meta data, used by visual and other components for fancy works, haps!
   */
  meta: {
    isFavorite?: boolean;
    /**
     * Artboard appearance meta.
     */
    artboard?: {
      /**
       *  Position on the artboard's coordinate system
       */
      position?: {
        x: number;
        y: number;
      };
    };
  };

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
   * Behavior tags.
   */
  tags: string[];

  /**
   * Access control
   */
  access: {
    create: 'public' | 'protected';
    read: 'public' | 'protected';
    update: 'public' | 'protected';
    delete: 'public' | 'protected';
  };
}
