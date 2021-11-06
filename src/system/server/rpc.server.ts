import { Provider } from '@loopback/context';
import config from 'config';
import { ServiceBroker } from 'moleculer';
import { Service } from '../container';

@Service(ServiceBroker)
export class RpcServerProvider implements Provider<ServiceBroker> {
  constructor() {}

  value() {
    const broker = new ServiceBroker({
      nodeID: config.get('node.id'),
      logLevel: 'warn',
    });

    return broker;
  }
}
