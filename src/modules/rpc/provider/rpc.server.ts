import { Provider } from '@loopback/context';
import { ServiceBroker } from 'moleculer';
import { Service } from '../../../app/container';

@Service(ServiceBroker)
export class RpcServerProvider implements Provider<ServiceBroker> {
  constructor() {}

  value() {
    const broker = new ServiceBroker({
      nodeID: process.env.ARTGEN_NODE_ID,
      logLevel: 'warn',
    });

    return broker;
  }
}
