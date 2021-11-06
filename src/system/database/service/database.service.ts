import config from 'config';
import { Dialect } from 'sequelize';
import { SchemaService } from '../../../content/schema/service/schema.service';
import { Exception } from '../../../exception';
import { Inject, Service } from '../../container';
import { IDatabase } from '../interface/database.interface';
import { Link } from '../library/link';

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
  async synchronize(link: Link) {
    const model = this.schemaService.model<IDatabase>('system', 'Database');

    let record = await model.findOne({
      where: {
        name: link.database.name,
      },
    });

    if (!record) {
      record = await model.create(link.database);
    } else {
      record = record.set(link.database);

      await record.save();
    }

    // Check if it exists in the local cache.
    const idx = this.registry.findIndex(s => s.name === link.database.name);

    if (idx !== -1) {
      this.registry.splice(idx, 1, record.get({ plain: true }));
    } else {
      this.registry.push(record.get({ plain: true }));
    }
  }

  /**
   * Fetch the newest schemas from the database, and use this opportunity to
   * ensure the local cache is up to date.
   */
  async findAll(): Promise<IDatabase[]> {
    const databases = await this.schemaService
      .model<IDatabase>('system', 'Database')
      .findAll();

    // Update the schemas, in case the database schema is not migrated.
    this.registry = databases.map(db => db.get({ plain: true }));

    return this.registry;
  }

  /**
   * Generates a database record based on the environment variables.
   * Database type is auto extracted from the DSN.
   */
  getSystem(): IDatabase {
    const dsn = config.get<string>('database.dsn');

    return {
      name: 'system',
      dsn: dsn,
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

    if (protocol === 'mariadb') {
      protocol = 'mysql';
    }

    if (['mongodb', 'postgres', 'mysql'].includes(protocol)) {
      return protocol as Dialect;
    } else {
      throw new Exception(`Unsupported database type [${protocol}]`);
    }
  }
}
