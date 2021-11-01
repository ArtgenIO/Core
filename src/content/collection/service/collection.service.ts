import {
  ConnectionManager,
  EntitySchema,
  EntitySchemaColumnOptions,
} from 'typeorm';
import { ILogger, Inject, Logger, Service } from '../../../system/container';
import { ICollection } from '../interface/collection.interface';

@Service()
export class CollectionService {
  protected collections: Map<string, ICollection> = new Map();

  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject('providers.ConnectionManagerProvider')
    readonly connectionManager: ConnectionManager,
  ) {}

  async seed() {}

  /**
   * Get the list of collections
   */
  findAll() {
    return this.collections.values();
  }

  /**
   * Find a colelction by reference
   */
  findByReference(ref: string) {
    return this.collections.has(ref) ? this.collections.get(ref) : null;
  }

  /**
   * Read the database schema from the database
   */
  async prepare() {}

  /**
   * Create the database table from a schema definition
   */
  async createRepository(
    col: ICollection,
    options: { shadow: boolean } = { shadow: true },
  ) {
    const columns: { [name: string]: EntitySchemaColumnOptions } = {};

    for (const field of col.fields) {
      // Local mapped name
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
      name: col.reference,
      tableName: col.tableName,
      schema: col.schema,
      columns: columns,
      synchronize: true,
    });

    // Register in the index
    this.collections.set(col.reference, col);

    this.logger.info('Collection [%s] model registered', col.reference);

    return entity;
  }

  async updateCollection(collection: ICollection) {
    //return this.createRepository(collection);
  }
}
