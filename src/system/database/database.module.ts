import { CrudService } from '../../content/crud/service/crud.service';
import { SchemaService } from '../../content/schema/service/schema.service';
import { ILogger, IModule, Inject, Logger, Module } from '../container';
import { getErrorMessage } from '../kernel';
import { DatabaseObserver } from './database.observer';
import { ILink } from './interface';
import { DatabaseImportLambda } from './lambda/import.lambda';
import { DatabaseConnectionFactory } from './library/database-connection.factory';
import { DatabaseService } from './service/database.service';
import { LinkService } from './service/link.service';

@Module({
  providers: [
    LinkService,
    DatabaseService,
    DatabaseConnectionFactory,
    DatabaseImportLambda,
    DatabaseObserver,
  ],
})
export class DatabaseModule implements IModule {
  constructor(
    @Logger()
    protected logger: ILogger,
    @Inject(CrudService)
    protected crudService: CrudService,
    @Inject(DatabaseService)
    protected databaseService: DatabaseService,
    @Inject(LinkService)
    protected linkService: LinkService,
    @Inject(SchemaService)
    protected schemaService: SchemaService,
  ) {}

  /**
   * Prepare the database
   */
  async onStart(): Promise<void> {
    // Create the system database link.
    const system = await this.linkService.create(
      this.databaseService.getSystem(),
      this.schemaService.getSystem(),
    );

    // Ensure that the system schemas are available in the database.
    await this.schemaService.synchronize(system);
    await this.databaseService.synchronize(system);

    const [schemas, databases] = await Promise.all([
      this.schemaService.findAll(),
      this.databaseService.findAll(),
    ]);

    const links: Promise<ILink | unknown>[] = [];

    // Map schemas to databases.
    for (const database of databases) {
      const dbSchemas = schemas.filter(s => s.database === database.name);
      const link = this.linkService.findByName(database.name);

      // Connection does not exists yet, load up with the scheams.
      if (!link) {
        links.push(
          this.linkService
            .create(database, dbSchemas)
            .catch(e =>
              this.logger
                .warn('Could not connect to [%s] database', database.name)
                .warn(getErrorMessage(e)),
            ),
        );
      }
      // Existing connection (system)
      else {
        links.push(
          link
            .manage(dbSchemas)
            .catch(e =>
              this.logger
                .warn(
                  'Could not load schemas to the [%s] database',
                  database.name,
                )
                .warn(getErrorMessage(e)),
            ),
        );
      }
    }

    await Promise.all(links);
  }

  async onStop() {
    await Promise.all(
      this.linkService
        .findAll()
        .map(c =>
          c
            .close()
            .then(() =>
              this.logger.info('Connection [%s] closed', c.database.name),
            ),
        ),
    );
  }
}
