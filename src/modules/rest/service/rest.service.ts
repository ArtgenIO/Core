import { EventEmitter2 } from 'eventemitter2';
import { diff } from 'just-diff';
import { ILogger, Inject, Logger } from '../../../app/container';
import { Exception } from '../../../app/exceptions/exception';
import { RowLike } from '../../../app/interface/row-like.interface';
import { getErrorMessage } from '../../../app/kernel';
import { SchemaService } from '../../schema/service/schema.service';
import { isManagedField, isPrimary } from '../../schema/util/field-tools';
import { IFindResponse } from '../interface/find-reponse.interface';
import { ODataService } from './odata.service';

/**
 * Provides CRUD functions with odata filtering and query compositions.
 */
export class RestService {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(SchemaService)
    readonly schema: SchemaService,
    @Inject(ODataService)
    readonly odata: ODataService,
    @Inject(EventEmitter2)
    readonly event: EventEmitter2,
  ) {}

  /**
   * Read multiple record.
   */
  async find(
    database: string,
    reference: string,
    filters: RowLike,
  ): Promise<IFindResponse> {
    const model = this.schema.getModel(database, reference);
    const schema = this.schema.getSchema(database, reference);

    try {
      const rowQuery = this.odata.toQueryBuilder(model, schema, filters);
      const cntQuery = rowQuery
        .clone()
        .clear('limit')
        .clear('offset')
        .clearOrder()
        .clearSelect()
        .clearWithGraph()
        .count('* as count')
        .toKnexQuery();

      const records = (await rowQuery).map(record => record.$toJson());

      return {
        meta: {
          total: parseInt((await cntQuery)[0].count, 10),
          count: records.length,
        },
        data: records,
      };
    } catch (error) {
      this.logger.warn(getErrorMessage(error));
      throw new Exception('Invalid input'); // 400
    }
  }

  /**
   * Create single record.
   */
  async create<R = RowLike>(
    database: string,
    reference: string,
    input: R,
  ): Promise<R> {
    // Load the model
    const model = this.schema.getModel(database, reference);
    const schema = this.schema.getSchema(database, reference);
    const event = `crud.${database}.${reference}.created`;

    try {
      const query = model.query().insertAndFetch(input);

      const record = await query;

      const newRecord = record.$toJson();
      this.event.emit(event, newRecord);

      return newRecord as R;
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
  ): Promise<RowLike | null> {
    // Load the model
    const model = this.schema.getModel(database, reference);
    const schema = this.schema.getSchema(database, reference);
    const pks = schema.fields.filter(isPrimary).map(f => f.reference);

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
  async list<R = RowLike>(database: string, reference: string): Promise<R[]> {
    // Load the model
    const model = this.schema.getModel(database, reference);
    const records = await model.query();

    if (records) {
      return records.map(r => r.$toJson()) as R[];
    }

    return null;
  }

  /**
   * Update multiple record based on their primary keys.
   */
  async update(
    database: string,
    reference: string,
    idValues: Record<string, string>,
    input: RowLike,
  ): Promise<RowLike | null> {
    // Define the event key.
    const event = `crud.${database}.${reference}.updated`;
    // Load the model
    const model = this.schema.getModel(database, reference);
    // Load the data schema
    const schema = this.schema.getSchema(database, reference);

    // Fetch the record
    const record = await model.query().findById(Object.values(idValues));

    if (!record) {
      return null;
    }

    const oldValue = record.$toJson();

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
      const newValue = record.$toJson();

      if (diff(newValue, oldValue).length) {
        this.event.emit(event, newValue, oldValue);
      }

      return newValue;
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
  ): Promise<RowLike | null> {
    // Define the event key.
    const event = `crud.${database}.${reference}.deleted`;
    // Get the model
    const model = this.schema.getModel(database, reference);

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
}
