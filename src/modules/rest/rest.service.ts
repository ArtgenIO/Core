import { EventEmitter2 } from 'eventemitter2';
import { FastifySchema } from 'fastify';
import { JSONSchema7Definition, JSONSchema7Object } from 'json-schema';
import { kebabCase } from 'lodash';
import { ILogger, Inject, Logger } from '../../app/container';
import { Exception } from '../../app/exceptions/exception';
import { getErrorMessage } from '../../app/kernel';
import { ContentAction } from '../content/interface/content-action.enum';
import { schemaToJsonSchema } from '../content/util/schema-to-jsonschema';
import { ISchema } from '../schema';
import { SchemaService } from '../schema/service/schema.service';
import { isManagedField, isPrimary } from '../schema/util/is-primary';

type SchemaInput = Record<string, unknown>;

/**
 * Provides CRUD functions with OData filtering and query compositions.
 */
export class RestService {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(SchemaService)
    readonly schema: SchemaService,
    @Inject(EventEmitter2)
    readonly event: EventEmitter2,
  ) {}

  /**
   * Create single record.
   */
  async create(
    database: string,
    reference: string,
    input: SchemaInput,
  ): Promise<unknown> {
    // Load the model
    const model = this.schema.model(database, reference);
    const event = `crud.${database}.${reference}.created`;

    try {
      const record = await model.query().insert(input);
      const object = record.$toJson();

      this.event.emit(event, object);

      return object;
    } catch (error) {
      this.logger.warn(getErrorMessage(error));
      throw new Exception('Invalid input'); // 400
    }
  }

  /**
   * Read single record.
   */
  async read(
    database: string,
    reference: string,
    filterKeys: object,
  ): Promise<unknown> {
    // Load the model
    const model = this.schema.model(database, reference);
    const schema = this.schema.findOne(database, reference);
    const pks = schema.fields.filter(isPrimary).map(f => f.reference);

    // Create query configuration from the OData filters.
    const queryConfig = {};

    for (const pk of pks) {
      queryConfig[pk] = filterKeys[pk];
    }

    const record = await model.query().findOne(queryConfig);

    if (record) {
      return record.$toJson();
    }

    return null;
  }

  /**
   * Read multiple record.
   */
  async list(database: string, reference: string): Promise<SchemaInput[]> {
    // Load the model
    const model = this.schema.model(database, reference);
    const records = await model.query();

    if (records) {
      return records.map(r => r.$toJson());
    }

    return null;
  }

  /**
   * Find multiple record.
   */
  async find(
    database: string,
    reference: string,
    conditions: Record<string, unknown>,
    attributes?: string[],
  ): Promise<SchemaInput[]> {
    // Load the model
    const model = this.schema.model(database, reference);

    const records = await model.query().where(conditions).select(attributes);

    return records.map(r => r.$toJson());
  }

  /**
   * Update multiple record based on their primary keys.
   */
  async update(
    database: string,
    reference: string,
    idValues: Record<string, string>,
    input: object,
  ): Promise<SchemaInput | null> {
    // Define the event key.
    const event = `crud.${database}.${reference}.updated`;
    // Load the model
    const model = this.schema.model(database, reference);
    // Load the data schema
    const schema = this.schema.findOne(database, reference);

    // Fetch the record
    const record = await model.query().findById(Object.values(idValues));

    if (!record) {
      return null;
    }

    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        const value = input[key];
        const field = schema.fields.find(f => f.reference === key);

        // Strip extra fields
        if (!field) {
          this.logger.warn(
            'Field [%s] does not exists on the schema [%s]',
            key,
            schema.reference,
          );
          continue;
        }

        // Skip on generated fields.
        if (isManagedField(field) || isPrimary(field)) {
          continue;
        }

        record[key] = value;
      }
    }

    try {
      // Commit the changes
      await record.$query().update();
      const object = record.$toJson();

      this.event.emit(event, object);

      return object;
    } catch (error) {
      this.logger.warn(getErrorMessage(error));
      throw new Exception('Invalid input');
    }
  }

  /**
   * Delete records based on the filters, responds with the count of deleted records
   */
  async delete(
    database: string,
    reference: string,
    idValues: Record<string, string>,
  ): Promise<SchemaInput | null> {
    // Define the event key.
    const event = `crud.${database}.${reference}.deleted`;
    // Get the model
    const model = this.schema.model(database, reference);

    // Fetch the record
    const record = await model.query().findById(Object.values(idValues));

    if (!record) {
      return null;
    }

    try {
      // Delete record
      const object = record.$toJson();
      await record.$query().delete();

      this.event.emit(event, object);

      return object;
    } catch (error) {
      this.logger.warn(getErrorMessage(error));
      throw new Exception('Invalid record');
    }
  }

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

  buildOpenApiDefinition(
    schema: ISchema,
    action: ContentAction,
  ): FastifySchema {
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
      case ContentAction.CREATE:
        definition.response[400] = this.getBadRequestResponseSchema();
        definition.response[201] = {
          description: 'Created',
          ...(schemaToJsonSchema(
            schema,
            ContentAction.READ,
          ) as JSONSchema7Object),
        };
        definition.body = schemaToJsonSchema(schema, ContentAction.CREATE);
        break;

      case ContentAction.READ:
        definition.response[400] = this.getBadRequestResponseSchema();
        definition.response[404] = this.getNotFoundResponseSchema();
        definition.response[200] = {
          description: 'OK',
          ...(schemaToJsonSchema(
            schema,
            ContentAction.READ,
          ) as JSONSchema7Object),
        };
        definition.params = this.getUrlParamsSchema(schema);
        break;

      case ContentAction.UPDATE:
        definition.response[400] = this.getBadRequestResponseSchema();
        definition.response[404] = this.getNotFoundResponseSchema();
        definition.response[200] = {
          description: 'OK',
          ...(schemaToJsonSchema(
            schema,
            ContentAction.READ,
          ) as JSONSchema7Object),
        };
        definition.body = schemaToJsonSchema(schema, ContentAction.CREATE);
        definition.params = this.getUrlParamsSchema(schema);
        break;

      case ContentAction.DELETE:
        definition.response[400] = this.getBadRequestResponseSchema();
        definition.response[404] = this.getNotFoundResponseSchema();
        definition.response[200] = {
          description: 'OK',
          ...(schemaToJsonSchema(
            schema,
            ContentAction.READ,
          ) as JSONSchema7Object),
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
          title: pk.label,
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
