import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ILogger, Logger, Service } from '../../../app/container';
import { IHttpGateway } from '../../http/interface/http-gateway.interface';

const WPTrapPaths = ['/wp-login.php', '/wp-admin'];
const OCTrapPaths = ['/config-dist.php'];

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
      res.header('X-Artgen-Security', 'violated');

      return 'Match made in heaven <3';
    };

    WPTrapPaths.forEach(path => httpServer.get(path, handler));
    this.logger.info('Traps for [WordPress] registered');

    OCTrapPaths.forEach(path => httpServer.get(path, handler));
    this.logger.info('Traps for [OpenCart] registered');
  }
}
