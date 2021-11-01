import { EntitySchema, EntitySchemaColumnOptions } from 'typeorm';
import { ILogger, Logger, Service } from '../../../system/container';
import { ICollection } from '../interface/collection.interface';

@Service()
export class EntitySchemaService {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}

  /**
   * Read the database schema from the database
   */
  getSchemas(): EntitySchema[] {
    return [];
  }

  /**
   * Create the database table from a schema definition
   */
  getSchemaFor(collection: ICollection): EntitySchema {
    const columns: { [name: string]: EntitySchemaColumnOptions } = {};

    for (const field of collection.fields) {
      const ref = field.reference;

      const columnDefinition: EntitySchemaColumnOptions = {
        type: field.type,
        primary: field.tags.includes('primary'),
        createDate: field.tags.includes('created'),
        updateDate: field.tags.includes('updated'),
        version: field.tags.includes('version'),
        name: field.columnName,
        nullable: field.tags.includes('nullable'),
        default: field.defaultValue,
      };

      if (field.tags.includes('primary')) {
        if (field.type === 'uuid') {
          columnDefinition.generated = 'uuid';
        } else if (field.type === 'int') {
          columnDefinition.generated = 'increment';
        }
      }

      columns[ref] = columnDefinition;
    }

    const entity = new EntitySchema({
      name: collection.reference,
      tableName: collection.tableName,
      schema: collection.schema,
      columns: columns,
      synchronize: true,
    });

    this.logger.info('Collection [%s] schema loaded', collection.reference);

    return entity;
  }
}
