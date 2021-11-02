import { FastifyInstance } from 'fastify';
import { ILogger, Logger, Service } from '../../../container';
import { IHttpGateway } from '../../../server/interface/http-gateway.interface';

@Service({
  tags: 'http:gateway',
})
export class AuthenticationGateway implements IHttpGateway {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}

  async register(httpServer: FastifyInstance): Promise<void> {}
}
