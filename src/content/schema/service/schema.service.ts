import { EventEmitter2 } from 'eventemitter2';
import { ConnectionManager, EntitySchema, Repository } from 'typeorm';
import { WorkflowSchema } from '../../../management/workflow/schema/workflow.schema';
import {
  IContext,
  ILogger,
  Inject,
  Logger,
  Service,
} from '../../../system/container';
import { DatabaseSchema } from '../../../system/database/schema/database.schema';
import { AccountSchema } from '../../../system/security/authentication/schema/account.schema';
import { PageSchema } from '../../page/schema/page.schema';
import { ISchema } from '../interface/schema.interface';
import { SchemaSchema } from '../schema/schema.schema';
import { schemaToEntity } from '../util/schema-to-entity';

type RecordSource = 'disk' | 'database';

type Record = {
  entity: EntitySchema;
  schema: ISchema;
  source: RecordSource;
};

@Service()
export class SchemaService {
  registry: Record[] = [];

  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject.context()
    readonly ctx: IContext,
    @Inject('providers.ConnectionManagerProvider')
    readonly connectionManager: ConnectionManager,
    @Inject('providers.EventHandlerProvider')
    readonly event: EventEmitter2,
  ) {}

  initialzie() {
    this.register(AccountSchema, 'disk');
    this.register(SchemaSchema, 'disk');
    this.register(DatabaseSchema, 'disk');
    this.register(PageSchema, 'disk');
    this.register(WorkflowSchema, 'disk');
  }

  /**
   * Register the schema and convert it into an entity schema.
   */
  register(schema: ISchema, source: RecordSource) {
    const record: Record = {
      schema,
      entity: schemaToEntity(
        schema,
        this.ctx.getSync(`database.${schema.database}.type`),
      ),
      source,
    };

    this.registry = this.registry.filter(
      r =>
        !(
          r.schema.database === schema.database &&
          r.schema.reference === schema.reference
        ),
    );

    this.registry.push(record);
  }

  findByDatabase(database: string) {
    return this.registry.filter(r => r.schema.database === database);
  }

  /**
   * Get the registry record for a schema
   */
  findOne(databaseName: string, schemaRef: string): Record {
    return this.registry.find(
      record =>
        record.schema.database === databaseName &&
        record.schema.reference === schemaRef,
    );
  }

  /**
   * Sync the offline schemas into the database or upsert them if needed.
   */
  async synchronizeOfflineSchemas() {
    // Get the database's ID
    const schemaRepo = this.getRepository(
      'system',
      'Schema',
    ) as Repository<ISchema>;

    // Upsert the local schemas to the database
    for (const staticSchema of this.getSystemSchemas()) {
      let row = await schemaRepo.findOne({
        where: {
          database: 'system',
          reference: staticSchema.schema.reference,
        },
      });

      if (!row) {
        row = schemaRepo.create({
          ...staticSchema.schema,
          database: 'system',
        });

        await schemaRepo.save(row);
      }
    }

    this.logger.info('System schemas are synchronized to the database');
  }

  /**
   * Get the offline schemas loaded from disk.
   */
  getSystemSchemas() {
    return this.registry.filter(r => r.source === 'disk');
  }

  /**
   * Fetch the entity repository for a schema
   */
  getRepository(databaseName: string, schemaRef: string): Repository<any> {
    // Check if the connection name is valid.
    if (!this.connectionManager.has(databaseName)) {
      throw new Error(`Database [${databaseName}] is not registered`);
    }

    const record = this.findOne(databaseName, schemaRef);

    if (!record) {
      throw new Error(
        `Schema [${databaseName}][${schemaRef}] is not registered`,
      );
    }

    const repository = this.connectionManager
      .get(databaseName)
      .getRepository(record.entity);

    return repository;
  }

  /**
   * Get the list of scheams
   */
  async findAll(): Promise<ISchema[]> {
    return this.getRepository('system', 'Schema').find();
  }

  /**
   * Get a schema by it's ID
   */
  async findById(id: string): Promise<ISchema> {
    const row: ISchema = await this.getRepository(
      'system',
      'Schema',
    ).findOneOrFail(id);

    return row;
  }

  async create(schema: Omit<ISchema, 'id'>) {
    const repository = this.getRepository('system', 'Schema');
    const entity: ISchema = repository.create(schema);

    const result = await repository.save(entity);

    this.register(schema, 'database');
    this.event.emit('content.schema.created', entity);

    return result;
  }

  async update(schema: ISchema) {
    const repository = this.getRepository('system', 'Schema');
    const entity: ISchema = await repository.findOneOrFail(schema.id);

    entity.label = schema.label;
    entity.tableName = schema.tableName;
    entity.fields = schema.fields;
    entity.indices = schema.indices;
    entity.uniques = schema.uniques;
    entity.tags = schema.tags;

    const result = await repository.save(entity);

    this.register(schema, 'database');
    this.event.emit('content.schema.updated', entity);

    return result;
  }
}
