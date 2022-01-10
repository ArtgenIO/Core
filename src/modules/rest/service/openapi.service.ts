import { FastifySchema } from 'fastify';
import { JSONSchema7Definition, JSONSchema7Object } from 'json-schema';
import { kebabCase } from 'lodash';
import { Service } from '../../../app/container';
import { schemaToJsonSchema } from '../../content/util/schema-to-jsonschema';
import { ISchema } from '../../schema';
import { isPrimary } from '../../schema/util/field-tools';
import { CrudAction } from '../interface/crud-action.enum';

@Service()
export class OpenApiService {
  constructor() {}

  getResourceURL(schema: ISchema): string {
    return `/api/rest/${kebabCase(schema.database)}/${kebabCase(
      schema.reference,
    )}`;
  }

  getRecordURL(schema: ISchema) {
    const primaryKeys = schema.fields.filter(isPrimary);
    const record =
      '/:' + primaryKeys.map(f => kebabCase(f.reference)).join('/:');

    return this.getResourceURL(schema) + record;
  }

  toJsonSchema(schema: ISchema, action: CrudAction): FastifySchema {
    const definition: FastifySchema = {
      tags: ['Rest'],
      security: [
        {
          jwt: [],
          accessKeyQuery: [],
          accessKeyHeader: [],
        },
      ],
      response: {
        401: this.getUnauthorizedResponseSchema(),
      },
    };

    switch (action) {
      case CrudAction.CREATE:
        definition.response[400] = this.getBadRequestResponseSchema();
        definition.response[201] = {
          description: 'Created',
          ...(schemaToJsonSchema(schema, CrudAction.READ) as JSONSchema7Object),
        };
        definition.body = schemaToJsonSchema(schema, CrudAction.CREATE);
        break;

      case CrudAction.READ:
        definition.response[400] = this.getBadRequestResponseSchema();
        definition.response[404] = this.getNotFoundResponseSchema();
        definition.response[200] = {
          description: 'OK',
          ...(schemaToJsonSchema(schema, CrudAction.READ) as JSONSchema7Object),
        };
        definition.params = this.getUrlParamsSchema(schema);
        break;

      case CrudAction.UPDATE:
        definition.response[400] = this.getBadRequestResponseSchema();
        definition.response[404] = this.getNotFoundResponseSchema();
        definition.response[200] = {
          description: 'OK',
          ...(schemaToJsonSchema(schema, CrudAction.READ) as JSONSchema7Object),
        };
        definition.body = schemaToJsonSchema(schema, CrudAction.CREATE);
        definition.params = this.getUrlParamsSchema(schema);
        break;

      case CrudAction.DELETE:
        definition.response[400] = this.getBadRequestResponseSchema();
        definition.response[404] = this.getNotFoundResponseSchema();
        definition.response[200] = {
          description: 'OK',
          ...(schemaToJsonSchema(schema, CrudAction.READ) as JSONSchema7Object),
        };
        definition.params = this.getUrlParamsSchema(schema);
        break;
    }

    return definition;
  }

  protected getUrlParamsSchema(schema: ISchema): JSONSchema7Definition {
    const primaryKeys = schema.fields.filter(isPrimary);
    const definition: JSONSchema7Definition = {
      type: 'object',
      properties: {},
      required: primaryKeys.map(pk => kebabCase(pk.reference)),
    };

    primaryKeys.forEach(
      pk =>
        (definition.properties[kebabCase(pk.reference)] = {
          title: pk.title,
          type: 'string',
        }),
    );

    return definition;
  }

  protected getUnauthorizedResponseSchema(): JSONSchema7Definition {
    return {
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
  }

  protected getBadRequestResponseSchema(): JSONSchema7Definition {
    return {
      description: 'Request input is not valid',
      type: 'object',
      properties: {
        error: {
          type: 'string',
          default: 'Bad Request',
        },
        statusCode: {
          type: 'number',
          default: 400,
        },
      },
    };
  }

  protected getNotFoundResponseSchema(): JSONSchema7Definition {
    return {
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
  }
}
