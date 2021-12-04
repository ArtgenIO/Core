import { EventEmitter2 } from 'eventemitter2';
import { merge } from 'lodash';
import { ParsedUrlQueryInput, stringify } from 'querystring';
import { ILogger, Inject, Logger } from '../../app/container';
import { getErrorMessage } from '../../app/kernel';
import { SchemaService } from '../schema/service/schema.service';
import { isManagedField, isPrimary } from '../schema/util/field-tools';
import { IODataResult } from './interface/odata-result.interface';

type SchemaInput = Record<string, unknown>;

/**
 * Provides CRUD functions with OData filtering and query compositions.
 */
export class ODataService {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(SchemaService)
    readonly schema: SchemaService,
    @Inject(EventEmitter2)
    readonly event: EventEmitter2,
  ) {}

  /**
   * Create multiple record.
   */
  async create(
    database: string,
    reference: string,
    records: SchemaInput[],
  ): Promise<IODataResult[]> {
    // Load the model
    const model = this.schema.model(database, reference);
    const result: IODataResult[] = [];
    const event = `crud.${database}.${reference}.created`;

    for (const input of records) {
      const startedAt = Date.now();

      try {
        const record = await model.query().insertAndFetch(input);
        const object = record.$toJson();

        this.event.emit(event, object);

        result.push({
          meta: {
            action: 'create',
            status: 'success',
            executionTime: Date.now() - startedAt,
          },
          data: object,
        });
      } catch (error) {
        result.push({
          meta: {
            action: 'create',
            status: 'error',
            executionTime: Date.now() - startedAt,
          },
          data: {
            message: getErrorMessage(error),
          },
        });
      }
    }

    return result;
  }

  /**
   * Read multiple record.
   */
  async read(
    database: string,
    reference: string,
    filters: SchemaInput,
  ): Promise<SchemaInput[]> {
    // Load the model
    const model = this.schema.model(database, reference);

    // Merge with the defualts
    const options = merge(
      {
        $top: 10,
        $skip: 0,
      },
      filters,
    ) as ParsedUrlQueryInput;

    // Convert it into string (the parser only accepts it in this format)
    const quertString = decodeURIComponent(stringify(options));

    // Create query configuration from the OData filters.
    // const queryConfig = parseOData(quertString, model.sequelize);
    const records = await model.query();

    return records.map(record => record.$toJson());
  }

  /**
   * Update multiple record based on their primary keys.
   */
  async update(
    database: string,
    reference: string,
    inputs: SchemaInput[],
  ): Promise<IODataResult[]> {
    // Define the event key.
    const event = `crud.${database}.${reference}.updated`;
    // Load the model
    const model = this.schema.model(database, reference);
    // Load the data schema
    const schema = this.schema.findOne(database, reference);
    const primaryKeys = schema.fields.filter(isPrimary).map(f => f.reference);
    const result: IODataResult[] = [];
    const queryFilters = {};
    const validInputs = [];

    // Prebuidl the query filter with empty arrays
    for (const pk of primaryKeys) {
      queryFilters[pk] = [];
    }

    for (const input of inputs) {
      const startedAt = Date.now();
      const inputKeys = Object.keys(input);
      const hasPrimaryKeys = primaryKeys.every(pk => inputKeys.includes(pk));

      // Check if the input provided the required primary keys.
      if (!hasPrimaryKeys) {
        result.push({
          meta: {
            status: 'error',
            action: 'update',
            executionTime: Date.now() - startedAt,
          },
          data: {
            message: 'Input does not have the required primary key(s) defined',
            input,
          },
        });

        continue;
      }

      for (const pk of primaryKeys) {
        queryFilters[pk].push(input[pk]);
      }

      validInputs.push(input);
    }

    // Fetch the records subjected for the update
    const records = await model
      .query()
      .where(queryFilters)
      .limit(validInputs.length);

    for (const input of validInputs) {
      const startedAt = Date.now();

      // Find the recrod for the input
      const record = records.find(r => {
        for (const pk of primaryKeys) {
          if (input[pk] !== r[pk]) {
            return false;
          }
        }

        return true;
      });

      // Check if the input matches any query-d PK
      if (!record) {
        result.push({
          meta: {
            status: 'error',
            action: 'update',
            executionTime: Date.now() - startedAt,
          },
          data: {
            message: 'Input does not match any database record',
            input,
          },
        });

        continue;
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
          if (isManagedField(field)) {
            continue;
          }

          record[key] = value;
        }
      }

      try {
        // Commit the changes
        await record.$query().update();
        const object = record.$toJson();

        result.push({
          meta: {
            action: 'update',
            status: 'success',
            executionTime: Date.now() - startedAt,
          },
          data: object,
        });

        this.event.emit(event, object);
      } catch (error) {
        result.push({
          meta: {
            action: 'update',
            status: 'error',
            executionTime: Date.now() - startedAt,
          },
          data: {
            message: getErrorMessage(error),
          },
        });
      }
    }

    return result;
  }

  /**
   * Delete records based on the filters, responds with the count of deleted records
   */
  async delete(
    database: string,
    reference: string,
    filters: SchemaInput,
  ): Promise<IODataResult> {
    const startedAt = Date.now();
    // Define the event key.
    const event = `crud.${database}.${reference}.deleted`;
    // Get the model
    const model = this.schema.model(database, reference);
    // Merge with a safer skip 0 option
    const options = merge(filters, {
      $skip: 0,
    });
    const queryString = decodeURIComponent(stringify(options as any));
    //const queryFilter = parseOData(queryString.toString(), model.sequelize);
    const records = await model.query();

    for (const record of records) {
      await record.$query().delete();

      this.event.emit(event, record.$toJson());
    }

    return {
      meta: {
        status: 'success',
        action: 'delete',
        executionTime: Date.now() - startedAt,
      },
      data: records.length,
    };
  }
}
