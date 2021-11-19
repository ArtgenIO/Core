import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteHandlerMethod,
} from 'fastify';
import { Inject, Service } from '../../app/container';
import { AuthenticationHandlerProvider } from '../authentication/provider/authentication-handler.provider';
import { ContentAction } from '../content/interface/content-action.enum';
import { IHttpGateway } from '../http/interface/http-gateway.interface';
import { SchemaService } from '../schema/service/schema.service';
import { RestService } from './rest.service';

@Service({
  tags: 'http:gateway',
})
export class RestGateway implements IHttpGateway {
  constructor(
    @Inject(RestService)
    readonly service: RestService,
    @Inject(SchemaService)
    readonly schema: SchemaService,
    @Inject(AuthenticationHandlerProvider)
    readonly authHandler: RouteHandlerMethod,
  ) {}

  async register(httpServer: FastifyInstance): Promise<void> {
    const schemas = await this.schema.findAll();
    const preHandler = this.authHandler;

    for (const schema of schemas) {
      // Create action
      httpServer.post(
        this.service.getResourceURL(schema),
        {
          schema: this.service.buildOpenApiDefinition(
            schema,
            ContentAction.CREATE,
          ),
          preHandler,
        },
        async (req: FastifyRequest, reply: FastifyReply): Promise<unknown> => {
          try {
            const response = await this.service.create(
              schema.database,
              schema.reference,
              req.body as any,
            );

            reply.statusCode = 201;

            return JSON.parse(JSON.stringify(response)); // TODO: need to convert the date into string before responding
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
        this.service.getRecordURL(schema),
        {
          schema: this.service.buildOpenApiDefinition(
            schema,
            ContentAction.READ,
          ),
          preHandler,
        },
        async (
          request: FastifyRequest<{ Params: Record<string, string> }>,
          reply: FastifyReply,
        ): Promise<unknown> => {
          const record = await this.service.read(
            schema.database,
            schema.reference,
            request.params,
          );

          if (record) {
            return JSON.parse(JSON.stringify(record));
          }

          // Handle the 404 error
          reply.statusCode = 404;

          return {
            error: 'Not Found',
            statusCode: 404,
          };
        },
      );

      // Update
      httpServer.patch(
        this.service.getRecordURL(schema),
        {
          schema: this.service.buildOpenApiDefinition(
            schema,
            ContentAction.UPDATE,
          ),
          preHandler,
        },
        async (
          req: FastifyRequest<{
            Body: object;
            Params: Record<string, string>;
          }>,
          reply: FastifyReply,
        ): Promise<unknown> => {
          try {
            const record = await this.service.update(
              schema.database,
              schema.reference,
              req.params,
              req.body as any,
            );

            if (record) {
              return JSON.parse(JSON.stringify(record));
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
        this.service.getRecordURL(schema),
        {
          schema: this.service.buildOpenApiDefinition(
            schema,
            ContentAction.DELETE,
          ),
          preHandler,
        },
        async (
          req: FastifyRequest<{ Params: Record<string, string> }>,
          reply: FastifyReply,
        ): Promise<unknown> => {
          try {
            const record = await this.service.delete(
              schema.database,
              schema.reference,
              req.params,
            );

            if (record) {
              return JSON.parse(JSON.stringify(record));
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
    }
  }
}
