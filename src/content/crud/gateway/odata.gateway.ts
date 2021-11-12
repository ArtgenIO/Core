import { FastifyInstance, FastifyRequest } from 'fastify';
import { snakeCase } from 'lodash';
import { Inject, Service } from '../../../system/container';
import { IHttpGateway } from '../../../system/server/interface/http-gateway.interface';
import { SchemaService } from '../../schema/service/schema.service';
import { CrudAction } from '../interface/crud-action.enum';
import { IODataResult } from '../interface/odata-result.interface';
import { ODataService } from '../service/odata.service';
import { schemaToJsonSchema } from '../util/schema-to-jsonschema';

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
      const url = `/api/odata/${snakeCase(schema.database)}/${snakeCase(
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
