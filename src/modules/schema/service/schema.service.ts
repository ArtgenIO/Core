import { EventEmitter2 } from 'eventemitter2';
import { Model, ModelClass } from 'objection';
import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { IBlueprint } from '../../blueprint/interface/extension.interface';
import { SystemBlueprintProvider } from '../../blueprint/provider/system-extension.provider';
import { IConnection } from '../../database/interface';
import { ConnectionService } from '../../database/service/connection.service';
import { ISchema } from '../interface/schema.interface';
import { MigrationService } from './migration.service';

type SchemaModel = ISchema & Model;

@Service()
export class SchemaService {
  /**
   * In memory cache to access schemas.
   */
  registry: ISchema[] = [];

  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(ConnectionService)
    readonly linkService: ConnectionService,
    @Inject(EventEmitter2)
    readonly event: EventEmitter2,
    @Inject(MigrationService)
    readonly migrator: MigrationService,
    @Inject(SystemBlueprintProvider)
    readonly sysExt: IBlueprint,
  ) {}

  /**
   * Synchronize the offline system schemas into the database, this allows the user
   * to extend on the system's behavior, the synchronizer will only ensure the
   * existence of the schema and does not overide it if its present.
   */
  async synchronize(link: IConnection) {
    // Get the schema repository.
    const model = this.getModel<SchemaModel>('system', 'Schema');

    for (const schema of link.getSchemas()) {
      const exists = await model.query().findOne({
        database: schema.database,
        reference: schema.reference,
      });

      if (!exists) {
        await model.query().insert(schema);
      }

      // Check if it exists in the local cache.
      const idx = this.registry.findIndex(
        s => s.database === schema.database && s.reference === schema.reference,
      );

      if (idx !== -1) {
        this.registry.splice(idx, 1, schema);
      } else {
        this.registry.push(schema);
      }
    }
  }

  /**
   * Responsible to load system schemas from JSON format.
   * Isolated without any database dependency so, it
   * can be used at bootstrap to load the system
   * schemas from local disk.
   */
  getSystem(): ISchema[] {
    return this.sysExt.schemas.map(s => this.migrator.migrate(s));
  }

  /**
   * Fetch the newest schemas from the database, and use this opportunity to
   * ensure the local cache is up to date.
   */
  async findAll(): Promise<ISchema[]> {
    const schemas = await this.getModel<SchemaModel>(
      'system',
      'Schema',
    ).query();

    // Update the schemas, in case the database schema is not migrated.
    this.registry = schemas.map(s => this.migrator.migrate(s.$toJson()));

    return this.registry;
  }

  /**
   * Get the repository for the given database and schema.
   */
  getModel<T extends Model = Model>(
    database: string,
    schema: string,
  ): ModelClass<T> {
    return this.linkService.findOne(database).getModel<T>(schema);
  }

  findByDatabase(database: string) {
    return this.registry.filter(s => s.database === database);
  }

  findOne(database: string, reference: string): ISchema {
    return this.registry.find(
      s => s.database === database && s.reference === reference,
    );
  }

  async create(schema: ISchema) {
    const model = this.getModel<SchemaModel>('system', 'Schema');
    await model.query().insert(schema);

    this.registry.push(schema);
    this.event.emit('schema.created', schema);

    return schema;
  }

  async update(update: ISchema) {
    const model = this.getModel<SchemaModel>('system', 'Schema');
    const record = await model.query().findOne({
      database: update.database,
      reference: update.reference,
    });

    record.$set(update);

    await model.query().patch(record);

    this.registry.splice(
      this.registry.findIndex(
        s => s.database === update.database && s.reference === update.reference,
      ),
      1,
      record.$toJson(),
    );

    this.event.emit('schema.updated', record);

    return record;
  }
}
