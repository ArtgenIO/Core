import { Constructor, Provider } from '@loopback/context';
import { IConnection } from '../interface';
import { Connection } from '../library/connection';

export class ConnectionConcrete implements Provider<Constructor<IConnection>> {
  value() {
    return Connection;
  }
}
