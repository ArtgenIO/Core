import { ServiceBroker } from 'moleculer';

export interface IRpcGateway {
  register(rpcServer: ServiceBroker): Promise<void>;
}
