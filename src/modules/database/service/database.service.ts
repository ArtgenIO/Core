import { Model } from 'objection';
import { Inject, Service } from '../../../app/container';
import { Exception } from '../../../app/exceptions/exception';
import { SchemaService } from '../../schema/service/schema.service';
import { IDatabaseLink } from '../interface';
import { IDatabase } from '../interface/database.interface';
import { Dialect } from '../interface/dialect.type';

type DatabaseModel = IDatabase & Model;

@Service()
export class DatabaseService {
  /**
   * In memory cache to access schemas.
   */
  protected registry: IDatabase[] = [];

  constructor(
    @Inject(SchemaService)
    readonly schemaService: SchemaService,
  ) {}

  /**
   * Synchronize a link's database into the database which stores the connections.
   */
  async synchronize(link: IDatabaseLink) {
    const model = this.schemaService.model<DatabaseModel>('system', 'Database');

    let record = await model.query().findById(link.database.name);

    if (!record) {
      record = await model.query().insertAndFetch(link.database);
    } else {
      record = record.$set(link.database);

      await record.$query().update();
    }

    // Check if it exists in the local cache.
    const idx = this.registry.findIndex(s => s.name === link.database.name);

    if (idx !== -1) {
      this.registry.splice(idx, 1, record.$toJson());
    } else {
      this.registry.push(record.$toJson());
    }
  }

  /**
   * Fetch the newest schemas from the database, and use this opportunity to
   * ensure the local cache is up to date.
   */
  async findAll(): Promise<IDatabase[]> {
    const databases = await this.schemaService
      .model<DatabaseModel>('system', 'Database')
      .query();

    // Update the schemas, in case the database schema is not migrated.
    this.registry = databases.map(db => db.$toJson());

    return this.registry;
  }

  /**
   * Generates a database record based on the environment variables.
   * Database type is auto extracted from the DSN.
   */
  getSystem(): IDatabase {
    const dsn = process.env.ARTGEN_DATABASE_DSN;

    return {
      name: 'system',
      dsn,
      type: this.getTypeFromDSN(dsn),
    };
  }

  /**
   * Get the database type from the given DSN
   *
   * @throws {Exception} When the DSN protocol is a not supported type.
   * @throws {Error} When the DSN is not a valid URL and not :memory:
   */
  getTypeFromDSN(dsn: string): Dialect {
    if (dsn === 'sqlite::memory:') {
      return 'sqlite';
    }

    let protocol: string = new URL(dsn).protocol.replace(':', '').toLowerCase();

    if (protocol === 'postgresql') {
      protocol = 'postgres';
    }

    if (
      ['mongodb', 'postgres', 'mysql', 'mariadb', 'sqlite'].includes(protocol)
    ) {
      return protocol as Dialect;
    } else {
      throw new Exception(`Unsupported database type [${protocol}]`);
    }
  }
}
