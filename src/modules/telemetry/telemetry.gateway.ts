import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ILogger, Inject, Logger, Service } from '../../app/container';
import { IHttpGateway } from '../http/interface/http-gateway.interface';
import { TelemetryService } from './telemetry.service';

@Service({
  tags: 'http:gateway',
})
export class TelemetryGateway implements IHttpGateway {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(TelemetryService)
    readonly service: TelemetryService,
  ) {}

  async register(httpServer: FastifyInstance): Promise<void> {
    const handler = async (
      req: FastifyRequest,
      res: FastifyReply,
    ): Promise<object> => {
      return this.service.getReadings();
    };

    httpServer.get('/api/telemetry', handler);
    this.logger.info('Telemetry API endpoint registered');
  }
}
