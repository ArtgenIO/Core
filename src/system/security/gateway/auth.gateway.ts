import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyJwtPlugin from 'fastify-jwt';
import { ILogger, Logger, Service } from '../../container';
import { IHttpGateway } from '../../server/interface/http-gateway.interface';

@Service({
  tags: 'http:gateway',
})
export class AuthGateway implements IHttpGateway {
  constructor(
    @Logger('AuthGateway')
    protected readonly logger: ILogger,
  ) {}

  async register(httpServer: FastifyInstance): Promise<void> {
    await httpServer.register(fastifyJwtPlugin, {
      secret: 'CONFIG_JWT_SECRET',
    });
    this.logger.info('JWT validator configured');

    httpServer.decorate(
      'authenticate',
      async function (req: FastifyRequest, rep: FastifyReply) {
        try {
          await req.jwtVerify();
        } catch (err) {
          rep.send(err);
        }
      },
    );
    this.logger.info('Authentication decorator registered');
  }

  // protected async verifyCredentials(
  //   email: string,
  //   password: string,
  // ): Promise<Record<string, string> | false> {
  //

  //   const account = (await repository.findOne({
  //     where: {
  //       email,
  //     },
  //   })) as Record<string, string>;

  //   if (account) {
  //     if (compareSync(password, account.password)) {
  //       return account;
  //     }
  //   }

  //   return false;
  // }
}
