import { FastifyInstance } from 'fastify';
import { Authenticator } from 'fastify-passport';
import { Inject, Service } from '../../../app/container';
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

    upstream.get('/api/identity/status', async (req, rep) => {
      return {
        canSignUp:
          process.env.ARTGEN_DEMO == '1' ||
          (await this.service.isSignUpAvailable()),
      };
    });
  }
}
