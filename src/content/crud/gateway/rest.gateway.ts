import { FastifyInstance, FastifyRequest } from 'fastify';
import { snakeCase } from 'lodash';
import { Inject, Service } from '../../../system/container';
import { IHttpGateway } from '../../../system/server/interface/http-gateway.interface';
import { SchemaService } from '../../schema/service/schema.service';
import { isPrimary } from '../../schema/util/is-primary';
import { CrudAction } from '../interface/crud-action.enum';
import { IODataResult } from '../interface/odata-result.interface';
import { RestService } from '../service/rest.service';
import { schemaToJsonSchema } from '../util/schema-to-jsonschema';

@Service({
  tags: 'http:gateway',
})
export class RestGateway implements IHttpGateway {
  constructor(
    @Inject(RestService)
    readonly service: RestService,
    @Inject(SchemaService)
    readonly schema: SchemaService,
  ) {}

  async register(httpServer: FastifyInstance): Promise<void> {
    const schemas = await this.schema.findAll();

    for (const schema of schemas) {
      const url = `/api/rest/${snakeCase(schema.database)}/${snakeCase(
        schema.reference,
      )}`;
      const pks = schema.fields.filter(isPrimary);
      const urlOne = '/:' + pks.map(f => f.reference).join('/:');

      const params = {
        type: 'object',
        properties: {},
        required: pks.map(pk => pk.reference),
      };

      for (const pk of pks) {
        params.properties[pk.reference] = {
          type: 'string',
          title: pk.label,
          description: `Type is [${pk.type}]`,
        };
      }

      const resp200 = {
        description: 'OK',
        ...(schemaToJsonSchema(schema, CrudAction.CREATE) as any),
      };

      const resp404 = {
        description: 'Not found',
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            default: '404',
          },
          message: {
            type: 'string',
            default: 'Not a found',
          },
        },
      };

      // Create action
      httpServer.post(
        url,
        {
          schema: {
            tags: ['Rest'],
            body: {
              type: 'array',
              items: schemaToJsonSchema(schema, CrudAction.CREATE),
            },
            response: {
              201: {
                ...resp200,
                description: 'Created',
              },
            },
          },
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
        url + urlOne,
        {
          schema: {
            tags: ['Rest'],
            params,
            response: {
              200: resp200,
              404: resp404,
            },
          },
        },
        async (
          req: FastifyRequest<{ Params: Record<string, string> }>,
        ): Promise<unknown> => {
          return this.service.read(
            schema.database,
            schema.reference,
            req.params as any,
          );
        },
      );

      // Update
      httpServer.patch(
        url + urlOne,
        {
          schema: {
            tags: ['Rest'],
            body: {
              type: 'array',
              items: schemaToJsonSchema(schema, CrudAction.UPDATE),
            },
            params,
            response: {
              201: {
                ...resp200,
                description: 'Updated',
              },
              404: resp404,
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
        url + urlOne,
        {
          schema: {
            tags: ['Rest'],
            params,
            response: {
              201: {
                ...resp200,
                description: 'Updated',
              },
              404: resp404,
            },
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
