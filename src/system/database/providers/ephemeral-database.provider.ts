import { Provider } from '@loopback/context';
import MongoMemoryServer from 'mongodb-memory-server-core';
import { ILogger, Logger } from '../../container';

export class EphemeralDatabaseProvider implements Provider<MongoMemoryServer> {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}

  async value(): Promise<MongoMemoryServer> {
    this.logger.info('Starting database instance...');

    const mongod = await MongoMemoryServer.create({
      instance: {
        dbName: 'artgen',
      },
    });

    this.logger.info('Ephemeral database available at [%s]', mongod.getUri());

    return mongod;
  }
}
