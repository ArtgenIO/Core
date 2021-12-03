import Inspector from '@directus/schema';
import { SchemaInspector } from '@directus/schema/dist/types/schema';
import { EventEmitter2 } from 'eventemitter2';
import { Knex } from 'knex';
import { isEqual } from 'lodash';
import { Model, ModelClass } from 'objection';
import { ILogger, Inject, Logger } from '../../../app/container';
import { Exception } from '../../../app/exceptions/exception';
import { ISchema } from '../../schema';
import { IDatabase, IDatabaseLink } from '../interface';
import { IAssociation } from '../interface/association.interface';
import { toModel } from './converters/to-model';
import { toStructure } from './converters/to-structure';
import { synchronize } from './synchronizer';

export class DatabaseLink implements IDatabaseLink {
  /**
   * Inner registry to track the schema associations and their synchronized structures
   */
  protected associations = new Map<string, IAssociation>();
  protected inspector: SchemaInspector;

  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(EventEmitter2)
    readonly eventBus: EventEmitter2,
    readonly connection: Knex,
    readonly database: IDatabase,
  ) {
    this.logger = this.logger.child({ scope: `Link:${this.getName()}` });

    // Create the inspector instance.
    this.inspector = Inspector(this.connection);
  }

  getName(): string {
    return this.database.name;
  }

  getModel<T extends Model = Model>(reference: string): ModelClass<T> {
    if (this.associations.has(reference)) {
      return this.associations.get(reference).model as ModelClass<T>;
    }

    throw new Exception(
      `Model [${reference}] is not associated with the [${this.getName()}] database`,
    );
  }

  getSchema(reference: string): ISchema {
    if (this.associations.has(reference)) {
      return this.associations.get(reference).schema;
    }

    throw new Exception(
      `Schema [${reference}] is not associated with the [${this.getName()}] database`,
    );
  }

  getSchemas(): ISchema[] {
    return Array.from(this.associations.values()).map(r => r.schema);
  }

  async associate(schemas: ISchema[]): Promise<void> {
    for (const schema of schemas) {
      const key = schema.reference;
      const structure = toStructure(schema);

      // Check if the schema is already associated with the registry.
      if (this.associations.has(key)) {
        const association = this.associations.get(key);

        // Update the schema ref
        association.schema = schema;

        // Check if the structure has changed.
        if (!isEqual(association.structure, structure)) {
          this.logger.info(
            'Schema [%s] structure has changed',
            schema.reference,
          );

          association.structure = structure;
          association.inSync = false;
        }
      } else {
        const model = toModel(schema).bindKnex(this.connection);

        this.associations.set(key, { schema, structure, inSync: false, model });
      }
    }

    await this.synchronize();
  }

  /**
   * Synchronize the schemas with the database and the ORM.
   */
  protected async synchronize(): Promise<void> {
    // Reduce the associations to only the changed schemas.
    const changes: ISchema[] = Array.from(this.associations.values())
      .filter(association => !association.inSync)
      .map(association => association.schema);

    // Nothing has changed, skip early.
    if (!changes.length) {
      return;
    }

    for (const schema of changes) {
      // Imported / protected schemas are not synchronized.
      if (!schema || schema.tags.includes('readonly')) {
        continue;
      }
      this.logger.debug('Synchornizing [%s] schema', schema.reference);

      await synchronize(schema, this.connection);

      this.associations.get(schema.reference).inSync = true;
    }

    this.logger.info('Associations has been synchronized');
    this.eventBus.emit(`link.${this.database.name}.updated`, this);
  }

  close(): Promise<void> {
    return this.connection.destroy();
  }
}
