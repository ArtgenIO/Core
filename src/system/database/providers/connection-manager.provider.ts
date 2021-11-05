import { Provider } from '@loopback/context';
import { ConnectionManager } from 'typeorm';
import { Service } from '../../container';

@Service(ConnectionManager)
export class ConnectionManagerProvider implements Provider<ConnectionManager> {
  value(): ConnectionManager {
    return new ConnectionManager();
  }
}
