import { ILogger, Inject, Logger, Service } from '@hisorange/kernel';
import EventEmitter2 from 'eventemitter2';
import { Model, ModelClass } from 'objection';
import { ISchema } from '../../models/schema.interface';
import { SystemBlueprint } from '../blueprints/system.blueprint';
import { IContentModule } from '../types/content-module.interface';
import { SchemaRef } from '../types/system-ref.enum';
import { DatabaseConnectionService } from './database-connection.service';

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
  ) {}

  /**
   * Ensure that the "System" module is inserted, otherwise the system resources could not link to it.
   */
  protected async upsertSystemModule(): Promise<void> {
    const model = this.getSysModel<ModuleModel>(SchemaRef.MODULE);
    const record = SystemBlueprint.content
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
