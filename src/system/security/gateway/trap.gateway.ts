import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ILogger, Logger, Service } from '../../container';
import { IHttpGateway } from '../../server/interface/http-gateway.interface';

const WPTrapPaths = ['/wp-login.php', '/wp-admin'];
const OCTrapPaths = ['/admin/config-dist.php', '/config-dist.php'];

@Service({
  tags: 'http:gateway',
})
export class TrapGateway implements IHttpGateway {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}

  async register(httpServer: FastifyInstance): Promise<void> {
    const handler = async (
      req: FastifyRequest,
      res: FastifyReply,
    ): Promise<string> => {
      this.logger.info('Trap triggered [%s]', req.ip);
      res.header['X-Artgen-Security'] = 'Violated';

      return 'Match made in heaven <3';
    };

    WPTrapPaths.forEach(path =>
      httpServer.get(
        path,
        {
          schema: {
            tags: ['$trap'],
          },
        },
        handler,
      ),
    );
    this.logger.info('Traps for [WordPress] registered');

    OCTrapPaths.forEach(path =>
      httpServer.get(
        path,
        {
          schema: {
            tags: ['$trap'],
          },
        },
        handler,
      ),
    );
    this.logger.info('Traps for [OpenCart] registered');
  }
}
