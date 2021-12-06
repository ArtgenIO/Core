import { Constructor, Provider } from '@loopback/context';
import { IConnection } from '../interface';
import { Connection } from '../library/connection';

/**
 * Connection concrete is used to create connection instances, it's in a provider
 * so, we can easily mock it's creation.
 */
export class ConnectionConcrete implements Provider<Constructor<IConnection>> {
  value() {
    return Connection;
  }
}
