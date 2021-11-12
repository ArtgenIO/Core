import { EventEmitter2 } from 'eventemitter2';
import { merge } from 'lodash';
import parseOData from 'odata-sequelize';
import { stringify } from 'querystring';
import { Op, WhereOptions } from 'sequelize';
import { Exception } from '../../../exception';
import { ILogger, Inject, Logger } from '../../../system/container';
import { getErrorMessage } from '../../../system/kernel';
import { SchemaService } from '../../schema/service/schema.service';
import { isManagedField, isPrimary } from '../../schema/util/is-primary';
import { IODataResult } from '../interface/odata-result.interface';

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

    const startedAt = Date.now();

    try {
      const record = await model.create(input);
      const object = record.get({ plain: true });

      this.event.emit(event, object);

      return object;
    } catch (error) {
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

    const record = await model.findOne({
      where: queryConfig,
    });

    if (record) {
      return record.get({ plain: true });
    }

    throw new Exception('Not a found'); // 404
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
    const queryFilters: WhereOptions = {};
    const validInputs = [];

    // Prebuidl the query filter with empty arrays
    for (const pk of primaryKeys) {
      queryFilters[pk] = { [Op.in]: [] };
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
        queryFilters[pk][Op.in].push(input[pk]);
      }

      validInputs.push(input);
    }

    // Fetch the records subjected for the update
    const records = await model.findAll({
      where: queryFilters,
      limit: validInputs.length,
    });

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

          record.set(key, value);
        }
      }

      try {
        // Commit the changes
        await record.save();
        const object = record.get({ plain: true });

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
    const queryFilter = parseOData(queryString.toString(), model.sequelize);
    const records = await model.findAll(queryFilter);

    for (const record of records) {
      await record.destroy();

      this.event.emit(event, record.get({ plain: true }));
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
