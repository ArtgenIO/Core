import { Provider, Service } from '@hisorange/kernel';
import { Constructor } from '@loopback/context';
import { DatabaseConnection } from '../library/database.connection';
import { IDatabaseConnection } from '../types/database-connection.interface';

/**
 * Connection concrete is used to create connection instances, it's in a provider
 * so, we can easily mock it's creation.
 */
@Service()
export class DatabaseConnectionConcrete
  implements Provider<Constructor<IDatabaseConnection>>
{
  value() {
    return DatabaseConnection;
  }
}
