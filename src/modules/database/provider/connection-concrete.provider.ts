import { Constructor, Provider } from '@loopback/context';
import { Service } from '../../../app/container';
import { IDatabaseConnection } from '../interface';
import { DatabaseConnection } from '../library/database.connection';

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
