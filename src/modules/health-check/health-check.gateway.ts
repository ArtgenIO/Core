import { FastifyInstance, FastifyLoggerInstance } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { ILogger, Inject, Logger, Service } from '../../app/container';
import { DatabaseConnectionService } from '../database/service/database-connection.service';
import { IHttpGateway } from '../http/interface/http-gateway.interface';

@Service({
  tags: 'http:gateway',
})
export class HealthCheckGateway implements IHttpGateway {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(DatabaseConnectionService)
    readonly connectionSvc: DatabaseConnectionService,
  ) {}

  async register(
    httpServer: FastifyInstance<
      Server,
      IncomingMessage,
      ServerResponse,
      FastifyLoggerInstance
    >,
  ): Promise<void> {
    httpServer.get('/--artgen/health-check', (req, rep) => {
      const database = {};

      for (const conn of this.connectionSvc.findAll()) {
        database[conn.database.ref] = {
          schemas: Array.from(conn.associations.values()).map(a => ({
            ref: a.schema.reference,
            inSync: a.inSync,
          })),
        };
      }

      rep.statusCode = 200;
      rep.send({
        status: 'ok',
        node: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
        },
        database,
      });
    });

    this.logger.info('HTTP endpoint registered');
  }
}
