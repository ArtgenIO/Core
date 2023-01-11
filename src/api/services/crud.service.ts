import { ILogger, Inject, Logger, Service } from '@hisorange/kernel';
import EventEmitter2 from 'eventemitter2';
import { diff } from 'just-diff';
import pick from 'lodash.pick';
import { BaseException } from '../exceptions/base.exception';
import { FieldTool, isManagedField, isPrimary } from '../library/field-tools';
import { IFindResponse } from '../types/find-reponse.interface';
import { RowLike } from '../types/row-like.interface';
import { ODataService } from './odata.service';
import { SchemaService } from './schema.service';

/**
 * Provides CRUD functions with odata filtering and query compositions.
 */
@Service()
export class CrudService {
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

      const [rowResult, cntResult] = await Promise.all([rowQuery, cntQuery]);

      return {
        meta: {
          total: parseInt(cntResult[0].count, 10) ?? 0,
          count: rowResult.length ?? 0,
        },
        data: rowResult.map(record => record.$toJson()),
      };
    } catch (error) {
      this.logger.warn((error as Error)?.message);
      console.error(error);
      throw new BaseException('Invalid input'); // 400
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
    const event = `crud.${database}.${reference}.created`;

    try {
      const query = model.query().insertAndFetch(input);

      const record = await query;

      const newRecord = record.$toJson();
      this.event.emit(event, newRecord);

      return newRecord as R;
    } catch (error) {
      this.logger.warn((error as Error)?.message);
      throw new BaseException('Invalid input'); // 400
    }
  }

  /**
   * Read single record.
   */
  async read(
    database: string,
    reference: string,
    filterKeys: RowLike,
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
    idValues: RowLike,
    input: RowLike,
  ): Promise<RowLike | null> {
    // Define the event key.
    const event = `crud.${database}.${reference}.updated`;
    // Load the model
    const model = this.schema.getModel(database, reference);
    // Load the data schema
    const schema = this.schema.getSchema(database, reference);
    // Extact the identifiers
    const pks = schema.fields.filter(FieldTool.isPrimary).map(f => f.reference);
    const ids = Object.values(pick(idValues, pks));

    if (pks.length !== ids.length) {
      throw new BaseException('Invalid identifiers');
    }

    // Fetch the record
    const record = await model.query().findById(ids);

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
      this.logger.warn((error as Error)?.message);
      throw new BaseException('Invalid input');
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
      this.logger.warn((error as Error)?.message);
      throw new BaseException('Invalid record');
    }
  }
}
