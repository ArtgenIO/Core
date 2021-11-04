import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ILogger, Inject, Logger, Service } from '../../../system/container';
import { IHttpGateway } from '../../../system/server/interface/http-gateway.interface';
import { CrudService } from '../service/crud.service';

@Service({
  tags: 'http:gateway',
})
export class CrudGateway implements IHttpGateway {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject('classes.CrudService')
    readonly service: CrudService,
  ) {}

  async register(httpServer: FastifyInstance): Promise<void> {
    // Create action
    httpServer.post(
      '/api/$system/content/crud/:id',
      async (
        req: FastifyRequest<{ Params: { id: string } }>,
        res: FastifyReply,
      ): Promise<unknown[]> => {
        return this.service.create(req.params.id, req.body);
      },
    );

    // Read
    httpServer.get(
      '/api/$system/content/crud/:id/read/:record',
      async (
        req: FastifyRequest<{ Params: { id: string; record: string } }>,
        res: FastifyReply,
      ): Promise<unknown> => {
        return this.service.fetchOne(req.params.id, req.params.record);
      },
    );

    // Update
    httpServer.patch(
      '/api/$system/content/crud/:id/update/:record',
      async (
        req: FastifyRequest<{
          Params: { id: string; record: string };
          Body: object;
        }>,
        res: FastifyReply,
      ): Promise<unknown> => {
        return this.service.update(req.params.id, req.params.record, req.body);
      },
    );

    // Delete
    httpServer.delete(
      '/api/$system/content/crud/:id/delete/:record',
      async (
        req: FastifyRequest<{
          Params: { id: string; record: string };
        }>,
        res: FastifyReply,
      ): Promise<unknown> => {
        return this.service.delete(req.params.id, req.params.record);
      },
    );

    // List action
    httpServer.get(
      '/api/$system/content/crud/:id',
      async (
        req: FastifyRequest<{ Params: { id: string } }>,
        res: FastifyReply,
      ): Promise<unknown[]> => {
        return this.service.fetchAll(req.params.id);
      },
    );

    this.logger.info(
      'CRUD [Index] registered at [GET][/api/$system/content/crud]',
    );
  }
}
