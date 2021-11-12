import { ISchema } from '..';
import { Service } from '../../../system/container';

/**
 * Responsible to ensure that the loaded schemas are always on system
 * expected version, will not persist the changes until the user
 * makes some update on them, but this way we can always
 * use the newest features without worrying about
 * compatibility issues.
 */
@Service()
export class SchemaMigrationService {
  /**
   * Ensure that the schema is up to date, this function migrates between versions
   * so the user does not have to worry about compability.
   */
  migrate(schema: ISchema): ISchema {
    return this.toVersion2(schema);
  }

  /**
   * Execute the migration from V1 to V2
   */
  protected toVersion2(schema: ISchema): ISchema {
    // Add missing version key.
    if (!schema?.version || schema.version < 2) {
      schema.version = 2;
    }

    // Add the default icon.
    if (!schema?.icon || !schema.icon.length) {
      schema.icon = 'table_chart';
    }

    // Add the permission.
    if (!schema?.permission || !schema.permission.length) {
      schema.permission = 'rw';
    }

    // Add the relations.
    if (!schema?.relations) {
      schema.relations = [];
    }

    // Add the field typeParams.
    for (const field of schema.fields) {
      if (!field?.typeParams) {
        field.typeParams = {
          values: [],
        };
      }

      if (!field.typeParams?.values) {
        field.typeParams.values = [];
      }
    }

    // Add the drawboard meta.
    if (!schema?.drawboard) {
      schema.drawboard = {
        position: {
          x: 0,
          y: 0,
        },
      };
    }

    return schema;
  }
}
