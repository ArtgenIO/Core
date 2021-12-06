import { FastifyInstance, FastifyRequest } from 'fastify';
import { kebabCase } from 'lodash';
import { Inject, Service } from '../../app/container';
import { ContentAction } from '../content/interface/content-action.enum';
import { schemaToJsonSchema } from '../content/util/schema-to-jsonschema';
import { IHttpGateway } from '../http/interface/http-gateway.interface';
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
  ) {}

  async register(httpServer: FastifyInstance): Promise<void> {
    const schemas = await this.schema.findAll();

    for (const schema of schemas) {
      const url = `/api/odata/${kebabCase(schema.database)}/${kebabCase(
        schema.reference,
      )}`;

      // Create action
      httpServer.post(
        url,
        {
          schema: {
            tags: ['OData'],
            body: {
              type: 'array',
              items: schemaToJsonSchema(schema, ContentAction.CREATE),
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
          schema: {
            tags: ['OData'],
            body: {
              type: 'array',
              items: schemaToJsonSchema(schema, ContentAction.UPDATE),
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
