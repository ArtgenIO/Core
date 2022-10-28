import { Authenticator } from '@fastify/passport';
import { Inject, Service } from '@hisorange/kernel';
import { FastifyInstance } from 'fastify';
import { IHttpGateway } from '../../http/interface/http-gateway.interface';
import { AuthenticationService } from '../service/authentication.service';

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
