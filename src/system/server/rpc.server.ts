import { Provider } from '@loopback/context';
import { ServiceBroker } from 'moleculer';
import { IApplication } from '../app/application.interface';
import { Inject, Service } from '../container';

@Service()
export class RpcServerProvider implements Provider<ServiceBroker> {
  constructor(
    @Inject('Application')
    readonly app: IApplication,
  ) {}

  value() {
    const broker = new ServiceBroker({
      nodeID: this.app.id,
      logLevel: 'warn',
    });

    return broker;
  }
}
