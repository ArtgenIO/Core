import { Provider } from '@loopback/context';
import config from 'config';
import { ConnectionManager } from 'typeorm';
import { CollectionEntity } from '../../../content/collection/collection/collection.collection';
import { WorkflowEntity } from '../../../management/workflow/collection/workflow.collection';
import { ILogger, Logger, Service } from '../../container';
import { DatabaseEntity } from '../collection/database.collection';

@Service()
export class ConnectionManagerProvider implements Provider<ConnectionManager> {
  constructor(@Logger('ConnectionManager') readonly logger: ILogger) {}

  async value(): Promise<ConnectionManager> {
    const manager = new ConnectionManager();

    const connection = manager.create({
      name: 'system',
      url: config.get('database.url'),
      type: config.get('database.driver') as any,
      loggerLevel: 'debug',
      timezone: 'UTC',
      entities: [DatabaseEntity, CollectionEntity, WorkflowEntity],
      synchronize: true,
    });

    this.logger.info('Connection [system] created');

    try {
      await connection.connect();
    } catch (error) {
      throw new Error('Could not connect to the [system] database');
    }

    this.logger.info('Connection [system] connected');

    return manager;
  }
}
