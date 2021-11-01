import { Provider } from '@loopback/context';
import { ConnectionManager } from 'typeorm';
import { Service } from '../../container';

@Service()
export class ConnectionManagerProvider implements Provider<ConnectionManager> {
  value(): ConnectionManager {
    return new ConnectionManager();
  }
}
