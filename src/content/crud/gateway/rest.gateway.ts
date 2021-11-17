import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteHandlerMethod,
} from 'fastify';
import { Inject, Service } from '../../../system/container';
import { AuthenticationHandlerProvider } from '../../../system/security/authentication/provider/authentication-handler.provider';
import { IHttpGateway } from '../../../system/server/interface/http-gateway.interface';
import { SchemaService } from '../../schema/service/schema.service';
import { CrudAction } from '../interface/crud-action.enum';
import { IODataResult } from '../interface/odata-result.interface';
import { RestService } from '../service/rest.service';

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
            CrudAction.CREATE,
          ),
          preHandler,
        },
        async (req: FastifyRequest): Promise<unknown> => {
          return this.service.create(
            schema.database,
            schema.reference,
            req.body as any,
          );
        },
      );

      // Read action
      httpServer.get(
        this.service.getRecordURL(schema),
        {
          schema: this.service.buildOpenApiDefinition(schema, CrudAction.READ),
          preHandler,
        },
        async (
          request: FastifyRequest<{ Params: Record<string, string> }>,
          response: FastifyReply,
        ): Promise<unknown> => {
          const record = await this.service.read(
            schema.database,
            schema.reference,
            request.params,
          );

          if (record) {
            return record;
          }

          // Handle the 404 error
          response.statusCode = 404;

          return {
            error: 'Not found',
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
            CrudAction.UPDATE,
          ),
          preHandler,
        },
        async (
          req: FastifyRequest<{
            Body: object;
          }>,
        ): Promise<IODataResult[]> => {
          return this.service.update(
            schema.database,
            schema.reference,
            req.body as any[],
          );
        },
      );

      // Delete
      httpServer.delete(
        this.service.getRecordURL(schema),
        {
          schema: this.service.buildOpenApiDefinition(
            schema,
            CrudAction.DELETE,
          ),
          preHandler,
        },
        async (req: FastifyRequest): Promise<IODataResult> => {
          return this.service.delete(
            schema.database,
            schema.reference,
            req.query as Record<string, any>,
          );
        },
      );
    }
  }
}
