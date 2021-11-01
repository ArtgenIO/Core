import config from 'config';
import { ConnectionManager } from 'typeorm';
import { Inject } from '../../container';
import { DatabaseEntity } from '../collection/database.collection';

export class DatabaseService {
  constructor(
    @Inject('providers.ConnectionManagerProvider')
    readonly connectionManager: ConnectionManager,
  ) {}

  async prepare() {
    const connection = this.connectionManager.get('system');
    const repository = connection.getRepository(DatabaseEntity);

    let systemConnection = await repository.findOne({
      reference: 'system',
    });

    if (!systemConnection) {
      systemConnection = new DatabaseEntity();
      systemConnection.id = '00000000-0000-0000-0001-000000000000';
      systemConnection.reference = 'system';
      systemConnection.tags = [];
    }

    systemConnection.type = config.get('database.driver');
    systemConnection.url = config.get('database.url');

    if (!systemConnection.tags.includes('active')) {
      systemConnection.tags.push('active');
    }

    await repository.save(systemConnection);
  }
}
