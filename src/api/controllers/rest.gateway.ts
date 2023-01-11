import {
  IKernel,
  ILogger,
  Inject,
  Kernel,
  Logger,
  Service,
} from '@hisorange/kernel';
import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteHandlerMethod,
} from 'fastify';
import { BadRequestError, NotFoundError } from 'http-errors-enhanced';
import kebabCase from 'lodash.kebabcase';
import { ISchema } from '../../models/schema.interface';
import { AuthenticationHandlerProvider } from '../providers/authentication-handler.provider';
import { CrudService } from '../services/crud.service';
import { OpenApiService } from '../services/openapi.service';
import { SchemaService } from '../services/schema.service';
import { SearchService } from '../services/search.service';
import { CrudAction } from '../types/crud-action.enum';
import { FieldTag } from '../types/field-tags.enum';
import { IHttpGateway } from '../types/http-gateway.interface';
import { RowLike } from '../types/row-like.interface';

type TenantRequest = FastifyRequest<{ Params: { tenantId: string } }>;
type TenantBody = RowLike & { tenantId: string };

@Service({
  tags: 'http:gateway',
})
export class RestGateway implements IHttpGateway {
  protected authHandler: RouteHandlerMethod | null = null;

  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(CrudService)
    readonly crud: CrudService,
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
    this.authHandler = await this.kernel.get<RouteHandlerMethod>(
      AuthenticationHandlerProvider,
    );

    const [hasSearch, allSchema] = await Promise.all([
      this.search.isAvailable(),
      await this.schema.fetchAll(),
    ]);

    await httpServer.register(
      async instance => {
        await Promise.all([
          this.registerAdminApi(instance, hasSearch, allSchema),
          this.registerTenantApi(instance, hasSearch, allSchema),
        ]);
      },
      {
        prefix: '/api',
      },
    );
  }

  async registerTenantApi(
    server: FastifyInstance,
    hasSearch: boolean,
    allSchema: ISchema[],
  ): Promise<void> {
    // Filter only the tenant schemas
    const schemas = allSchema.filter(s =>
      s.fields.some(f => f.tags.includes(FieldTag.TENANT)),
    );

    for (const schema of schemas) {
      this.logger.info(
        'Registering tenant routes for [%s] schema',
        schema.reference,
      );

      // Create action (TENANT)
      server.post(
        this.openApi.getResourceURL(schema, 'rest', {
          isTenant: true,
        }),
        {
          schema: this.openApi.toFastifySchema(schema, CrudAction.CREATE, true),
          preHandler:
            schema.access.create !== 'public' ? this.authHandler : null,
        },
        async (req: TenantRequest, reply: FastifyReply): Promise<unknown> => {
          try {
            const body = req.body as TenantBody;
            body.tenantId = req.params.tenantId; // Attach tenant ID

            const record = await this.crud.create(
              schema.database,
              schema.reference,
              body,
            );

            reply.statusCode = 201;
            reply.header('content-type', 'application/json');

            delete record['tenantId'];

            return JSON.stringify(record);
          } catch (error) {
            throw new BadRequestError();
          }
        },
      );

      // Read action (TENANT)
      server.get(
        this.openApi.getRecordURL(schema, {
          isTenant: true,
        }),
        {
          schema: this.openApi.toFastifySchema(schema, CrudAction.READ, true),
          preHandler: schema.access.read !== 'public' ? this.authHandler : null,
        },
        async (
          request: FastifyRequest<{ Params: RowLike }>,
          reply: FastifyReply,
        ): Promise<unknown> => {
          const record = await this.crud.read(
            schema.database,
            schema.reference,
            request.params,
          );

          if (!record) {
            throw new NotFoundError();
          }

          reply.header('content-type', 'application/json');
          delete record['tenantId'];

          return JSON.stringify(record);
        },
      );

      // Find action (TENANT)
      server.get(
        this.openApi.getResourceURL(schema, 'rest', {
          isTenant: true,
        }),
        {
          schema: this.openApi.toFastifySchema(schema, CrudAction.FIND, true),
          preHandler: schema.access.read !== 'public' ? this.authHandler : null,
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

          const records = await this.crud.find(
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
      server.patch(
        this.openApi.getRecordURL(schema, {
          isTenant: true,
        }),
        {
          schema: this.openApi.toFastifySchema(schema, CrudAction.UPDATE, true),
          preHandler:
            schema.access.update !== 'public' ? this.authHandler : null,
        },
        async (
          req: FastifyRequest<{
            Body: RowLike;
            Params: RowLike;
          }>,
          reply: FastifyReply,
        ): Promise<unknown> => {
          try {
            const record = await this.crud.update(
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

            throw new NotFoundError();
          } catch (error) {
            throw new BadRequestError();
          }
        },
      );

      // Delete (TENANT)
      server.delete(
        this.openApi.getRecordURL(schema, {
          isTenant: true,
        }),
        {
          schema: this.openApi.toFastifySchema(schema, CrudAction.DELETE, true),
          preHandler:
            schema.access.delete !== 'public' ? this.authHandler : null,
        },
        async (
          req: FastifyRequest<{ Params: Record<string, string> }>,
          reply: FastifyReply,
        ): Promise<unknown> => {
          try {
            const params = req.params;
            delete params['tenant']; // Remove tenant params
            params['tenantId'] = req.params.tenant; // Add as tenantId ref

            const record = await this.crud.delete(
              schema.database,
              schema.reference,
              req.params,
            );

            if (record) {
              delete record['tenantId'];
              reply.header('content-type', 'application/json');
              return JSON.stringify(record);
            }

            throw new NotFoundError();
          } catch (error) {
            throw new BadRequestError();
          }
        },
      );

      if (hasSearch) {
        // Search query
        server.get(
          this.openApi.getResourceURL(schema, 'search', {
            isTenant: true,
          }) + '/:term',
          {
            //schema: this.openApi.toFastifySchema(schema, CrudAction.CREATE),
            schema: {
              tags: ['Search', 'Tenant'],
            },
            preHandler:
              schema.access.create !== 'public' ? this.authHandler : null,
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
              throw new BadRequestError();
            }
          },
        );

        // Search reindex
        server.patch(
          this.openApi.getResourceURL(schema, 'search', {
            isTenant: true,
          }),
          {
            //schema: this.openApi.toFastifySchema(schema, CrudAction.CREATE),
            schema: {
              tags: ['Search', 'Tenant'],
            },
            preHandler:
              schema.access.create !== 'public' ? this.authHandler : null,
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
              throw new BadRequestError();
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

  async registerAdminApi(
    server: FastifyInstance,
    hasSearch: boolean,
    allSchema: ISchema[],
  ): Promise<void> {
    for (const schema of allSchema) {
      // Create action
      server.post(
        this.openApi.getResourceURL(schema),
        {
          schema: this.openApi.toFastifySchema(schema, CrudAction.CREATE),
          preHandler:
            schema.access.create !== 'public' ? this.authHandler : null,
        },
        async (req: FastifyRequest, reply: FastifyReply): Promise<unknown> => {
          try {
            const response = await this.crud.create(
              schema.database,
              schema.reference,
              req.body as any,
            );

            reply.statusCode = 201;
            reply.header('content-type', 'application/json');

            return JSON.stringify(response);
          } catch (error) {
            throw new BadRequestError();
          }
        },
      );

      // Read action
      server.get(
        this.openApi.getRecordURL(schema),
        {
          schema: this.openApi.toFastifySchema(schema, CrudAction.READ),
          preHandler: schema.access.read !== 'public' ? this.authHandler : null,
        },
        async (
          request: FastifyRequest<{ Params: Record<string, string> }>,
          reply: FastifyReply,
        ): Promise<unknown> => {
          const record = await this.crud.read(
            schema.database,
            schema.reference,
            request.params,
          );

          if (record) {
            reply.header('content-type', 'application/json');
            return JSON.stringify(record);
          }

          throw new NotFoundError();
        },
      );

      // Find action
      server.get(
        this.openApi.getResourceURL(schema),
        {
          schema: this.openApi.toFastifySchema(schema, CrudAction.FIND),
          preHandler: schema.access.read !== 'public' ? this.authHandler : null,
        },
        async (
          request: FastifyRequest,
          reply: FastifyReply,
        ): Promise<string> => {
          const records = await this.crud.find(
            schema.database,
            schema.reference,
            request.query as RowLike,
          );

          reply.header('content-type', 'application/json');
          return JSON.stringify(records);
        },
      );

      // Update
      server.patch(
        this.openApi.getRecordURL(schema),
        {
          schema: this.openApi.toFastifySchema(schema, CrudAction.UPDATE),
          preHandler:
            schema.access.update !== 'public' ? this.authHandler : null,
        },
        async (
          req: FastifyRequest<{
            Body: object;
            Params: Record<string, string>;
          }>,
          reply: FastifyReply,
        ): Promise<unknown> => {
          try {
            const record = await this.crud.update(
              schema.database,
              schema.reference,
              req.params,
              req.body as any,
            );

            if (record) {
              reply.header('content-type', 'application/json');
              return JSON.stringify(record);
            }

            throw new NotFoundError();
          } catch (error) {
            throw new BadRequestError();
          }
        },
      );

      // Delete
      server.delete(
        this.openApi.getRecordURL(schema),
        {
          schema: this.openApi.toFastifySchema(schema, CrudAction.DELETE),
          preHandler:
            schema.access.delete !== 'public' ? this.authHandler : null,
        },
        async (
          req: FastifyRequest<{ Params: Record<string, string> }>,
          reply: FastifyReply,
        ): Promise<unknown> => {
          try {
            const record = await this.crud.delete(
              schema.database,
              schema.reference,
              req.params,
            );

            if (record) {
              reply.header('content-type', 'application/json');
              return JSON.stringify(record);
            }

            throw new NotFoundError();
          } catch (error) {
            throw new BadRequestError();
          }
        },
      );

      if (hasSearch) {
        // Search query
        server.get(
          this.openApi.getResourceURL(schema, 'search') + '/:term',
          {
            //schema: this.openApi.toFastifySchema(schema, CrudAction.CREATE),
            schema: {
              tags: ['Search'],
            },
            preHandler:
              schema.access.create !== 'public' ? this.authHandler : null,
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
              throw new BadRequestError();
            }
          },
        );

        // Search reindex
        server.patch(
          this.openApi.getResourceURL(schema, 'search'),
          {
            //schema: this.openApi.toFastifySchema(schema, CrudAction.CREATE),
            schema: {
              tags: ['Search'],
            },
            preHandler:
              schema.access.create !== 'public' ? this.authHandler : null,
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
              throw new BadRequestError();
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
