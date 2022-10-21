import { IKernel, ILogger, Inject, Kernel, Logger, Service } from '@hisorange/kernel';
import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteHandlerMethod
} from 'fastify';
import NoCachePlugin from 'fastify-disablecache';
import kebabCase from 'lodash.kebabcase';
import { RowLike } from '../../app/interface/row-like.interface';
import { IHttpGateway } from '../http/interface/http-gateway.interface';
import { AuthenticationHandlerProvider } from '../identity/provider/authentication-handler.provider';
import { FieldTag } from '../schema';
import { SchemaService } from '../schema/service/schema.service';
import { CrudAction } from './interface/crud-action.enum';
import { OpenApiService } from './service/openapi.service';
import { RestService } from './service/rest.service';
import { SearchService } from './service/search.service';

type TenantRequest = FastifyRequest<{ Params: { tenantId: string } }>;

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
    @Inject(SearchService)
    readonly search: SearchService,
    @Inject(Kernel)
    readonly kernel: IKernel,
  ) {}

  async register(httpServer: FastifyInstance): Promise<void> {
    await httpServer.register(NoCachePlugin);
    await this.registerAdminApi(httpServer);
    await this.registerTenantApi(httpServer);
  }

  async registerTenantApi(httpServer: FastifyInstance): Promise<void> {
    // Filter only the tenant schemas
    const schemas = (await this.schema.fetchAll()).filter(s =>
      s.fields.some(f => f.tags.includes(FieldTag.TENANT)),
    );

    const authPrehandler = await this.kernel.get<RouteHandlerMethod>(
      AuthenticationHandlerProvider,
    );
    const hasSearch = await this.search.isAvailable();

    for (const schema of schemas) {
      this.logger.info(
        'Registering tenant routes for [%s] schema',
        schema.reference,
      );

      // Create action (TENANT)
      httpServer.post(
        this.openApi.getResourceURL(schema, 'rest', true),
        {
          schema: this.openApi.toFastifySchema(schema, CrudAction.CREATE, true),
          preHandler: schema.access.create !== 'public' ? authPrehandler : null,
        },
        async (req: TenantRequest, reply: FastifyReply): Promise<unknown> => {
          try {
            const body = req.body as any;
            body.tenantId = req.params.tenantId; // Attach tenant ID

            const record = await this.rest.create(
              schema.database,
              schema.reference,
              body,
            );

            reply.statusCode = 201;
            reply.header('content-type', 'application/json');

            delete record['tenantId'];

            return JSON.stringify(record);
          } catch (error) {
            reply.statusCode = 400;

            return {
              statusCode: 400,
              error: 'Bad Request',
            };
          }
        },
      );

      // Read action (TENANT)
      httpServer.get(
        this.openApi.getRecordURL(schema, true),
        {
          schema: this.openApi.toFastifySchema(schema, CrudAction.READ, true),
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
            delete record['tenantId'];

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

      // Find action (TENANT)
      httpServer.get(
        this.openApi.getResourceURL(schema, 'rest', true),
        {
          schema: this.openApi.toFastifySchema(schema, CrudAction.FIND, true),
          preHandler: schema.access.read !== 'public' ? authPrehandler : null,
        },
        async (
          request: FastifyRequest<{
            Querystring: RowLike;
            Params: { tenantId: string };
          }>,
          reply: FastifyReply,
        ): Promise<string> => {
          const query = request.query;

          if (query['$filter']) {
            // Attach as "and filter"
            if (query['$filter'].match(/\)$/)) {
              query['$filter'] = query['$filter'].replace(
                /\)$/,
                ` and tenantId eq '${request.params.tenantId}')`,
              );
            }
            // Attach as the filter
            else {
              if (query['$filter'].length) {
                query[
                  '$filter'
                ] += ` and tenantId eq '${request.params.tenantId}'`;
              } else {
                query['$filter'] = `tenantId eq '${request.params.tenantId}'`;
              }
            }
          }
          // No filter
          else {
            query['$filter'] = `tenantId eq '${request.params.tenantId}'`;
          }

          const records = await this.rest.find(
            schema.database,
            schema.reference,
            query,
          );

          for (const record of records.data) {
            delete record['tenantId'];
          }

          reply.header('content-type', 'application/json');
          return JSON.stringify(records);
        },
      );

      // Update (TENANT)
      httpServer.patch(
        this.openApi.getRecordURL(schema, true),
        {
          schema: this.openApi.toFastifySchema(schema, CrudAction.UPDATE, true),
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
              req.body,
            );

            if (record) {
              delete record['tenantId'];
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

      // Delete (TENANT)
      httpServer.delete(
        this.openApi.getRecordURL(schema, true),
        {
          schema: this.openApi.toFastifySchema(schema, CrudAction.DELETE, true),
          preHandler: schema.access.delete !== 'public' ? authPrehandler : null,
        },
        async (
          req: FastifyRequest<{ Params: Record<string, string> }>,
          reply: FastifyReply,
        ): Promise<unknown> => {
          try {
            const params = req.params;
            delete params['tenant']; // Remove tenant params
            params['tenantId'] = req.params.tenant; // Add as tenantId ref

            const record = await this.rest.delete(
              schema.database,
              schema.reference,
              req.params,
            );

            if (record) {
              delete record['tenantId'];
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

      if (hasSearch) {
        // Search query
        httpServer.get(
          this.openApi.getResourceURL(schema, 'search', true) + '/:term',
          {
            //schema: this.openApi.toFastifySchema(schema, CrudAction.CREATE),
            schema: {
              tags: ['Search', 'Tenant'],
            },
            preHandler:
              schema.access.create !== 'public' ? authPrehandler : null,
          },
          async (
            req: FastifyRequest<{ Params: { term: string } }>,
            reply: FastifyReply,
          ): Promise<unknown> => {
            try {
              const response = await this.search.query(
                schema.database,
                schema.reference,
                req.params.term,
              );

              reply.statusCode = 200;
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

        // Search reindex
        httpServer.patch(
          this.openApi.getResourceURL(schema, 'search', true),
          {
            //schema: this.openApi.toFastifySchema(schema, CrudAction.CREATE),
            schema: {
              tags: ['Search', 'Tenant'],
            },
            preHandler:
              schema.access.create !== 'public' ? authPrehandler : null,
          },
          async (
            req: FastifyRequest<{ Params: { term: string } }>,
            reply: FastifyReply,
          ): Promise<unknown> => {
            try {
              const response = await this.search.index(
                schema.database,
                schema.reference,
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
      }

      this.logger.info(
        'REST (tenant) routes for [%s/%s] registered',
        kebabCase(schema.database),
        kebabCase(schema.reference),
      );
    }
  }

  async registerAdminApi(httpServer: FastifyInstance): Promise<void> {
    const schemas = await this.schema.fetchAll();
    const authPrehandler = await this.kernel.get<RouteHandlerMethod>(
      AuthenticationHandlerProvider,
    );
    const hasSearch = await this.search.isAvailable();

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

      if (hasSearch) {
        // Search query
        httpServer.get(
          this.openApi.getResourceURL(schema, 'search') + '/:term',
          {
            //schema: this.openApi.toFastifySchema(schema, CrudAction.CREATE),
            schema: {
              tags: ['Search'],
            },
            preHandler:
              schema.access.create !== 'public' ? authPrehandler : null,
          },
          async (
            req: FastifyRequest<{ Params: { term: string } }>,
            reply: FastifyReply,
          ): Promise<unknown> => {
            try {
              const response = await this.search.query(
                schema.database,
                schema.reference,
                req.params.term,
              );

              reply.statusCode = 200;
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

        // Search reindex
        httpServer.patch(
          this.openApi.getResourceURL(schema, 'search'),
          {
            //schema: this.openApi.toFastifySchema(schema, CrudAction.CREATE),
            schema: {
              tags: ['Search'],
            },
            preHandler:
              schema.access.create !== 'public' ? authPrehandler : null,
          },
          async (
            req: FastifyRequest<{ Params: { term: string } }>,
            reply: FastifyReply,
          ): Promise<unknown> => {
            try {
              const response = await this.search.index(
                schema.database,
                schema.reference,
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
      }

      this.logger.info(
        'REST routes for [%s/%s] registered',
        kebabCase(schema.database),
        kebabCase(schema.reference),
      );
    }
  }
}
