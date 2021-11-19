import { ILogger, IModule, Inject, Logger, Module } from '../../app/container';
import { getErrorMessage } from '../../app/kernel';
import { ContentService } from '../content/service/content.service';
import { SchemaService } from '../schema/service/schema.service';
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
    @Inject(ContentService)
    protected crudService: ContentService,
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
    await this.databaseService.synchronize(system);
    await this.schemaService.synchronize(system);

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
        links.push(link.setSchemas(dbSchemas));
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
