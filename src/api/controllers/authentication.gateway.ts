import { Authenticator } from '@fastify/passport';
import { Inject, Service } from '@hisorange/kernel';
import { FastifyInstance } from 'fastify';
import { AuthenticationService } from '../services/authentication.service';
import { IHttpGateway } from '../types/http-gateway.interface';

@Service({
  tags: 'http:gateway',
})
export class IdentityGateway implements IHttpGateway {
  constructor(
    @Inject(Authenticator)
    readonly authenticator: Authenticator,
    @Inject(AuthenticationService)
    readonly service: AuthenticationService,
  ) {}

  async register(upstream: FastifyInstance): Promise<void> {
    await upstream.register(this.authenticator.initialize());
    await upstream.register(this.authenticator.secureSession());
  }
}
