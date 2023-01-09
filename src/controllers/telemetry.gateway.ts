import { ILogger, Inject, Logger, Service } from '@hisorange/kernel';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { TelemetryService } from '../services/telemetry.service';
import { IHttpGateway } from '../types/http-gateway.interface';

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

    httpServer.get(
      '/api/telemetry/serie/:id',
      async (
        req: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply,
      ) => {
        return this.service
          .getReadings()
          .readings.find(s => s.id === req.params.id);
      },
    );

    this.logger.info('Telemetry API endpoint registered');
  }
}
