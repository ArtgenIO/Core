import { FastifyInstance } from 'fastify';
import { Authenticator } from 'fastify-passport';
import { Inject, Service } from '../../../container';
import { IHttpGateway } from '../../../server/interface/http-gateway.interface';

@Service({
  tags: 'http:gateway',
})
export class AuthenticationGateway implements IHttpGateway {
  constructor(
    @Inject(Authenticator)
    readonly authenticator: Authenticator,
  ) {}

  async register(httpServer: FastifyInstance): Promise<void> {
    await httpServer.register(this.authenticator.initialize());
    await httpServer.register(this.authenticator.secureSession());
  }
}
