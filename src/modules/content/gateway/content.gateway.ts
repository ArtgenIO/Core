import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Authenticator } from 'fastify-passport';
import { Inject, Service } from '../../../app/container';
import { STRATEGY_CONFIG } from '../../authentication/util/strategy.config';
import { IHttpGateway } from '../../http/interface/http-gateway.interface';
import { ContentService } from '../service/content.service';

type SchemaParams = {
  database: string;
  reference: string;
};

type RecordParams = SchemaParams & { record: string };

@Service({
  tags: 'http:gateway',
})
export class ContentGateway implements IHttpGateway {
  constructor(
    @Inject(ContentService)
    readonly service: ContentService,
    @Inject(Authenticator)
    readonly authenticator: Authenticator,
  ) {}

  async register(httpServer: FastifyInstance): Promise<void> {
    const schemaURL = '/api/content/:database/:reference';
    const preHandler = this.authenticator.authenticate(
      ['jwt', 'token'],
      STRATEGY_CONFIG,
      async (
        request: FastifyRequest,
        reply: FastifyReply,
        err: null | Error,
        user?: unknown,
        info?: unknown,
        statuses?: (number | undefined)[],
      ) => {
        if (!user) {
          reply.statusCode = 401;
          reply.send({
            error: 'Unauthorized',
            message: 'Please authenticate your request',
            statusCode: 401,
          });
        }
      },
    );

    // Create action
    httpServer.post(
      schemaURL,
      {
        preHandler,
      },
      async (
        req: FastifyRequest<{ Params: SchemaParams }>,
        res: FastifyReply,
      ): Promise<Record<string, unknown>> => {
        return this.service.create(
          req.params.database,
          req.params.reference,
          req.body as any,
        );
      },
    );

    // Update
    httpServer.patch(
      schemaURL,
      {
        preHandler,
      },
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
      {
        preHandler,
      },
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
      {
        preHandler,
      },
      async (
        req: FastifyRequest<{ Params: SchemaParams }>,
        res: FastifyReply,
      ): Promise<unknown[]> => {
        return this.service.readOData(
          req.params.database,
          req.params.reference,
          req.query as Record<string, any>,
        );
      },
    );
  }
}
