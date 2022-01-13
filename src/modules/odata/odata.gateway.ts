import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from 'fastify';
import { kebabCase } from 'lodash';
import { Inject, Service } from '../../app/container';
import { IKernel, Kernel } from '../../app/kernel';
import { schemaToJsonSchema } from '../content/util/schema-to-jsonschema';
import { IHttpGateway } from '../http/interface/http-gateway.interface';
import { AuthenticationHandlerProvider } from '../identity/provider/authentication-handler.provider';
import { CrudAction } from '../rest/interface/crud-action.enum';
import { SchemaService } from '../schema/service/schema.service';
import { IODataResult } from './interface/odata-result.interface';
import { ODataService } from './odata.service';

@Service({
  tags: 'http:gateway',
})
export class ODataGateway implements IHttpGateway {
  constructor(
    @Inject(ODataService)
    readonly service: ODataService,
    @Inject(SchemaService)
    readonly schema: SchemaService,
    @Inject(Kernel)
    readonly kernel: IKernel,
  ) {}

  async register(httpServer: FastifyInstance): Promise<void> {
    const schemas = await this.schema.fetchAll();
    const preHandler = await this.kernel.get<RouteHandlerMethod>(
      AuthenticationHandlerProvider,
    );

    for (const schema of schemas) {
      const url = `/api/odata/${kebabCase(schema.database)}/${kebabCase(
        schema.reference,
      )}`;

      // Create action
      httpServer.post(
        url,
        {
          preHandler,
          schema: {
            tags: ['OData'],
            body: {
              type: 'array',
              items: schemaToJsonSchema(schema, CrudAction.CREATE),
            },
          },
        },
        async (req: FastifyRequest): Promise<IODataResult[]> => {
          return this.service.create(
            schema.database,
            schema.reference,
            req.body as any,
          );
        },
      );

      // Read action
      httpServer.get(
        url,
        {
          preHandler,
          schema: {
            tags: ['OData'],
          },
        },
        async (req: FastifyRequest): Promise<unknown[]> => {
          return this.service.read(
            schema.database,
            schema.reference,
            req.query as Record<string, unknown>,
          );
        },
      );

      // Update
      httpServer.patch(
        url,
        {
          preHandler,
          schema: {
            tags: ['OData'],
            body: {
              type: 'array',
              items: schemaToJsonSchema(schema, CrudAction.UPDATE),
            },
          },
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
        url,
        {
          preHandler,
          schema: {
            tags: ['OData'],
          },
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
