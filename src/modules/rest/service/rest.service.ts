import { EventEmitter2 } from 'eventemitter2';
import { ILogger, Inject, Logger } from '../../../app/container';
import { Exception } from '../../../app/exceptions/exception';
import { getErrorMessage } from '../../../app/kernel';
import { SchemaService } from '../../schema/service/schema.service';
import { isManagedField, isPrimary } from '../../schema/util/field-tools';
import { ODataService } from './odata.service';

type Row = Record<string, unknown> | object;

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
    filters: Row,
  ): Promise<Row[]> {
    const model = this.schema.getModel(database, reference);
    const schema = this.schema.getSchema(database, reference);

    return (await this.odata.toQuery(model, schema, filters)).map(record =>
      record.$toJson(),
    );
  }

  /**
   * Create single record.
   */
  async create<R = Row>(
    database: string,
    reference: string,
    input: R,
  ): Promise<R> {
    // Load the model
    const model = this.schema.getModel(database, reference);
    const event = `crud.${database}.${reference}.created`;

    try {
      const record = await model.query().insert(input);
      const object = record.$toJson();

      this.event.emit(event, object);

      return object as R;
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
  ): Promise<Row | null> {
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
  async list<R = Row>(database: string, reference: string): Promise<R[]> {
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
    input: Row,
  ): Promise<Row | null> {
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
  ): Promise<Row | null> {
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
