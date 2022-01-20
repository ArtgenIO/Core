import { EventEmitter2 } from 'eventemitter2';
import { Model, ModelClass } from 'objection';
import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { IBlueprint } from '../../blueprint/interface/blueprint.interface';
import { SystemBlueprintProvider } from '../../blueprint/provider/system-blueprint.provider';
import { IContentModule } from '../../content/interface/content-module.interface';
import { IDatabaseConnection } from '../../database/interface';
import { DatabaseConnectionService } from '../../database/service/database-connection.service';
import { ISchema } from '../interface/schema.interface';
import { SchemaRef } from '../interface/system-ref.enum';

type SchemaModel = ISchema & Model;
type ModuleModel = IContentModule & Model;

@Service()
export class SchemaService {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(DatabaseConnectionService)
    readonly connections: DatabaseConnectionService,
    @Inject(EventEmitter2)
    readonly event: EventEmitter2,
    @Inject(SystemBlueprintProvider)
    readonly systemBlueprint: IBlueprint,
  ) {}

  /**
   * Synchronize the offline schemas into the database, this allows the user
   * to extend on the system's behavior, the synchronizer will only ensure the
   * existence of the schema and does not overide it if its present.
   */
  async persistSchemas(connection: IDatabaseConnection) {
    const model = this.getSysModel<SchemaModel>(SchemaRef.SCHEMA);

    // Main connection need to insert the "System" module first.
    if (connection.database.ref === 'main') {
      await this.upsertSystemModule();
    }

    for (const schema of connection.getSchemas()) {
      const isSchemaExists = await model.query().findOne({
        database: schema.database,
        reference: schema.reference,
      });

      if (!isSchemaExists) {
        await model.query().insert(schema);
      }
    }
  }

  /**
   * Ensure that the "System" module is inserted, otherwise the system resources could not link to it.
   */
  protected async upsertSystemModule(): Promise<void> {
    const model = this.getSysModel<ModuleModel>(SchemaRef.MODULE);
    const record = this.systemBlueprint.content
      .Module[0] as unknown as IContentModule;

    const isExists = await model.query().findById(record.id);

    if (!isExists) {
      await model.query().insert(record);
    }
  }

  /**
   * Fetch the newest schemas from the database, and use this opportunity to
   * ensure the local cache is up to date.
   */
  async fetchAll(): Promise<ISchema[]> {
    return (await this.getSysModel<SchemaModel>(SchemaRef.SCHEMA).query()).map(
      s => s.$toJson(),
    );
  }

  /**
   * Get the repository for the given database and schema.
   */
  getModel<T extends Model = Model>(
    database: string,
    schema: string,
  ): ModelClass<T> {
    return this.connections.findOne(database).getModel<T>(schema);
  }

  /**
   * Same as the model fetch, but only for system
   */
  getSysModel<T extends Model = Model>(schema: SchemaRef): ModelClass<T> {
    return this.connections.findOne('main').getModel<T>(schema);
  }

  getSchema(database: string, reference: string): ISchema {
    return this.connections.findOne(database).getSchema(reference);
  }
}
