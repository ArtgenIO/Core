import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteHandlerMethod,
} from 'fastify';
import kebabCase from 'lodash.kebabcase';
import { ILogger, Inject, Logger, Service } from '../../app/container';
import { RowLike } from '../../app/interface/row-like.interface';
import { IKernel, Kernel } from '../../app/kernel';
import { IHttpGateway } from '../http/interface/http-gateway.interface';
import { AuthenticationHandlerProvider } from '../identity/provider/authentication-handler.provider';
import { SchemaService } from '../schema/service/schema.service';
import { CrudAction } from './interface/crud-action.enum';
import { OpenApiService } from './service/openapi.service';
import { RestService } from './service/rest.service';

@Service({
  tags: 'http:gateway',
})
export class RestGateway implements IHttpGateway {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(RestService)
    readonly rest: RestService,
    @Inject(OpenApiService)
    readonly openApi: OpenApiService,
    @Inject(SchemaService)
    readonly schema: SchemaService,
    @Inject(Kernel)
    readonly kernel: IKernel,
  ) {}

  async register(httpServer: FastifyInstance): Promise<void> {
    const schemas = await this.schema.fetchAll();
    const authPrehandler = await this.kernel.get<RouteHandlerMethod>(
      AuthenticationHandlerProvider,
    );

    for (const schema of schemas) {
      // Create action
      httpServer.post(
        this.openApi.getResourceURL(schema),
        {
          schema: this.openApi.toFastifySchema(schema, CrudAction.CREATE),
          preHandler: schema.access.create !== 'public' ? authPrehandler : null,
        },
        async (req: FastifyRequest, reply: FastifyReply): Promise<unknown> => {
          try {
            const response = await this.rest.create(
              schema.database,
              schema.reference,
              req.body as any,
            );

            reply.statusCode = 201;
            reply.header('content-type', 'application/json');

            return JSON.stringify(response);
          } catch (error) {
            reply.statusCode = 400;

            return {
              statusCode: 400,
              error: 'Bad Request',
            };
          }
        },
      );

      // Read action
      httpServer.get(
        this.openApi.getRecordURL(schema),
        {
          schema: this.openApi.toFastifySchema(schema, CrudAction.READ),
          preHandler: schema.access.read !== 'public' ? authPrehandler : null,
        },
        async (
          request: FastifyRequest<{ Params: Record<string, string> }>,
          reply: FastifyReply,
        ): Promise<unknown> => {
          const record = await this.rest.read(
            schema.database,
            schema.reference,
            request.params,
          );

          if (record) {
            reply.header('content-type', 'application/json');
            return JSON.stringify(record);
          }

          // Handle the 404 error
          reply.statusCode = 404;

          return {
            error: 'Not Found',
            statusCode: 404,
          };
        },
      );

      // Find action
      httpServer.get(
        this.openApi.getResourceURL(schema),
        {
          schema: this.openApi.toFastifySchema(schema, CrudAction.FIND),
          preHandler: schema.access.read !== 'public' ? authPrehandler : null,
        },
        async (
          request: FastifyRequest,
          reply: FastifyReply,
        ): Promise<string> => {
          const records = await this.rest.find(
            schema.database,
            schema.reference,
            request.query as RowLike,
          );

          reply.header('content-type', 'application/json');
          return JSON.stringify(records);
        },
      );

      // Update
      httpServer.patch(
        this.openApi.getRecordURL(schema),
        {
          schema: this.openApi.toFastifySchema(schema, CrudAction.UPDATE),
          preHandler: schema.access.update !== 'public' ? authPrehandler : null,
        },
        async (
          req: FastifyRequest<{
            Body: object;
            Params: Record<string, string>;
          }>,
          reply: FastifyReply,
        ): Promise<unknown> => {
          try {
            const record = await this.rest.update(
              schema.database,
              schema.reference,
              req.params,
              req.body as any,
            );

            if (record) {
              reply.header('content-type', 'application/json');
              return JSON.stringify(record);
            }

            // Handle the 404 error
            reply.statusCode = 404;

            return {
              error: 'Not Found',
              statusCode: 404,
            };
          } catch (error) {
            reply.statusCode = 400;

            return {
              statusCode: 400,
              error: 'Bad Request',
            };
          }
        },
      );

      // Delete
      httpServer.delete(
        this.openApi.getRecordURL(schema),
        {
          schema: this.openApi.toFastifySchema(schema, CrudAction.DELETE),
          preHandler: schema.access.delete !== 'public' ? authPrehandler : null,
        },
        async (
          req: FastifyRequest<{ Params: Record<string, string> }>,
          reply: FastifyReply,
        ): Promise<unknown> => {
          try {
            const record = await this.rest.delete(
              schema.database,
              schema.reference,
              req.params,
            );

            if (record) {
              reply.header('content-type', 'application/json');
              return JSON.stringify(record);
            }

            // Handle the 404 error
            reply.statusCode = 404;

            return {
              error: 'Not Found',
              statusCode: 404,
            };
          } catch (error) {
            reply.statusCode = 400;

            return {
              statusCode: 400,
              error: 'Bad Request',
            };
          }
        },
      );

      this.logger.info(
        'REST routes for [%s/%s] registered',
        kebabCase(schema.database),
        kebabCase(schema.reference),
      );
    }
  }
}
