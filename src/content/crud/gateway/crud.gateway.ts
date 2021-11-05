import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Inject, Service } from '../../../system/container';
import { IHttpGateway } from '../../../system/server/interface/http-gateway.interface';
import { CrudService } from '../service/crud.service';

type SchemaParams = {
  database: string;
  reference: string;
};

type RecordParams = SchemaParams & { record: string };

@Service({
  tags: 'http:gateway',
})
export class CrudGateway implements IHttpGateway {
  constructor(
    @Inject(CrudService)
    readonly service: CrudService,
  ) {}

  async register(httpServer: FastifyInstance): Promise<void> {
    const schemaURL = '/api/content/:database/:reference';
    const recordURL = `${schemaURL}/:record`;

    // Create action
    httpServer.post(
      schemaURL,
      async (
        req: FastifyRequest<{ Params: SchemaParams }>,
        res: FastifyReply,
      ): Promise<unknown[]> => {
        return this.service.create(
          req.params.database,
          req.params.reference,
          req.body,
        );
      },
    );

    // Update
    httpServer.patch(
      schemaURL,
      async (
        req: FastifyRequest<{
          Params: RecordParams;
          Body: object;
        }>,
        res: FastifyReply,
      ): Promise<unknown> => {
        return this.service.update(
          req.params.database,
          req.params.reference,
          req.query as Record<string, any>,
          req.body,
        );
      },
    );

    // Delete
    httpServer.delete(
      schemaURL,
      async (
        req: FastifyRequest<{
          Params: RecordParams;
        }>,
        res: FastifyReply,
      ): Promise<unknown> => {
        return this.service.delete(
          req.params.database,
          req.params.reference,
          req.query as Record<string, any>,
        );
      },
    );

    // Read action
    httpServer.get(
      schemaURL,
      async (
        req: FastifyRequest<{ Params: SchemaParams }>,
        res: FastifyReply,
      ): Promise<unknown[]> => {
        return this.service.read(
          req.params.database,
          req.params.reference,
          req.query as Record<string, any>,
        );
      },
    );
  }
}
