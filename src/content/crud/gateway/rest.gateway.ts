import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Authenticator } from 'fastify-passport';
import { kebabCase } from 'lodash';
import { Inject, Service } from '../../../system/container';
import { STRATEGY_CONFIG } from '../../../system/security/authentication/util/strategy.config';
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
    @Inject(Authenticator)
    readonly authenticator: Authenticator,
  ) {}

  async register(httpServer: FastifyInstance): Promise<void> {
    const schemas = await this.schema.findAll();
    const security = [
      {
        jwt: [],
        accessKeyQuery: [],
        accessKeyHeader: [],
      },
    ];
    const tags = ['Rest'];
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
            statusCode: 401,
          });
        }
      },
    );

    const resp401 = {
      description: 'Request is not authenticated',
      type: 'object',
      properties: {
        error: {
          type: 'string',
          default: 'Unauthorized',
        },
        statusCode: {
          type: 'number',
          default: 401,
        },
      },
    };

    const resp404 = {
      description: 'Resource not found',
      type: 'object',
      properties: {
        error: {
          type: 'string',
          default: 'Not found',
        },
        statusCode: {
          type: 'number',
          default: 404,
        },
      },
    };

    for (const schema of schemas) {
      const url = `/api/rest/${kebabCase(schema.database)}/${kebabCase(
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
        description: 'Successfull',
        ...(schemaToJsonSchema(schema, CrudAction.READ) as any),
      };

      // Create action
      httpServer.post(
        url,
        {
          schema: {
            tags,
            security,
            body: schemaToJsonSchema(schema, CrudAction.CREATE),
            response: {
              201: resp200,
              401: resp401,
            },
          },
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
        url + urlOne,
        {
          schema: {
            tags,
            security,
            params,
            response: {
              200: resp200,
              401: resp401,
              404: resp404,
            },
          },
          preHandler,
        },
        async (
          request: FastifyRequest<{ Params: Record<string, string> }>,
          response: FastifyReply,
        ): Promise<unknown> => {
          const record = this.service.read(
            schema.database,
            schema.reference,
            request.params as any,
          );

          if (!record) {
            response.statusCode = 404;
            return {
              error: 'Not found',
              statusCode: 404,
            };
          } else {
            return record;
          }
        },
      );

      // Update
      httpServer.patch(
        url + urlOne,
        {
          schema: {
            tags,
            security,
            body: schemaToJsonSchema(schema, CrudAction.UPDATE),
            params,
            response: {
              201: resp200,
              401: resp401,
              404: resp404,
            },
          },
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
        url + urlOne,
        {
          schema: {
            tags,
            security,
            params,
            response: {
              201: resp200,
              401: resp401,
              404: resp404,
            },
          },
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
