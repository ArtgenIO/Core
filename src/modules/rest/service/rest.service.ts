import { EventEmitter2 } from 'eventemitter2';
import { merge, pick } from 'lodash';
import { Model, ModelClass, Operator, QueryBuilder } from 'objection';
import parser from 'odata-parser';
import { ParsedUrlQueryInput, stringify } from 'querystring';
import { ILogger, Inject, Logger } from '../../../app/container';
import { Exception } from '../../../app/exceptions/exception';
import { getErrorMessage } from '../../../app/kernel';
import { ISchema } from '../../schema';
import { SchemaService } from '../../schema/service/schema.service';
import { isManagedField, isPrimary } from '../../schema/util/field-tools';

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
    @Inject(EventEmitter2)
    readonly event: EventEmitter2,
  ) {}

  protected tOperator(op: string): Operator {
    if (op === 'eq') {
      return '=';
    }

    throw new Exception(`Unknown [${op}] operator`);
  }

  protected toConditions(q: QueryBuilder<any>, $filter: any) {
    //console.log('$filter', $filter);

    if ($filter.type == 'eq') {
      q.where(
        $filter.left.name,
        this.tOperator($filter.type),
        $filter.right.value,
      );
    } else if ($filter.type == 'and') {
      const s = this;

      q.andWhere(function () {
        s.toConditions(this, $filter.left);
        s.toConditions(this, $filter.right);
      });
    } else if ($filter.type == 'or') {
      const s = this;

      q.orWhere(function () {
        s.toConditions(this, $filter.left);
        s.toConditions(this, $filter.right);
      });
    }
  }

  protected runQuery(model: ModelClass<Model>, schema: ISchema, ast: any) {
    const q = model.query();

    if (ast?.$filter) {
      this.toConditions(q, ast.$filter);
    }

    if (ast?.$top) {
      q.limit(parseInt(ast.$top, 10));
    }

    if (ast?.$skip) {
      q.offset(parseInt(ast.$skip, 10));
    }

    if (ast?.$select) {
      const fieldNames = schema.fields.map(f => f.reference);
      const relationNames = schema.relations.map(r => r.name);
      const fieldSelection = new Set<string>();
      const eagerSelection = new Set<string>();
      const trimmedEager = new Map<string, string[]>();

      for (const s of ast?.$select as string[]) {
        if (!s.match('/')) {
          // Select from the schema fields
          if (fieldNames.includes(s)) {
            fieldSelection.add(s);
          }
          // Select from relations as whole
          else if (relationNames.includes(s)) {
            eagerSelection.add(s);
          }
          // Select all
          else if (s == '*') {
            fieldNames.forEach(f => fieldSelection.add(f));
          } else {
            throw new Exception(`Unknown selection [${s}]`);
          }
        }
        // Load from relation
        else {
          const rel = s.substring(0, s.indexOf('/'));

          if (relationNames.includes(rel)) {
            q.withGraphFetched(rel);

            if (!trimmedEager.has(rel)) {
              trimmedEager.set(rel, []);
            }

            trimmedEager.get(rel).push(s.substring(rel.length + 1));
          } else {
            throw new Exception(`Unknown relation [${s}][${rel}]`);
          }
        }
      }

      if (fieldSelection.size) {
        q.select(
          Array.from(fieldSelection.values()).map(
            fRef => schema.fields.find(f => f.reference == fRef).columnName,
          ),
        );
      }

      if (eagerSelection.size) {
        q.withGraphFetched(
          `[${Array.from(eagerSelection.values()).join(', ')}]`,
        );
      }

      for (const [rel, selects] of trimmedEager.entries()) {
        q.modifyGraph(rel, b => {
          b.select(selects);
        });
      }
    }

    return q;
  }

  /**
   * Read multiple record.
   */
  async find(
    database: string,
    reference: string,
    filters: Row,
  ): Promise<Row[]> {
    // Load the model
    const model = this.schema.getModel(database, reference);
    const schema = this.schema.getSchema(database, reference);

    // Merge with the defualts
    const options = pick(
      merge(
        {
          $top: 10,
          $skip: 0,
        },
        filters,
      ),
      ['$top', '$skip', '$select', '$filter'],
    ) as ParsedUrlQueryInput;

    // Convert it into string (the parser only accepts it in this format)
    const qs = decodeURIComponent(stringify(options));
    // console.log({ qs });

    try {
      const ast = parser.parse(qs);
      // console.log({ ast });
      const q = this.runQuery(model, schema, ast);
      console.log(q.toKnexQuery().toQuery());

      const records = await q;

      return records.map(record => record.$toJson());
    } catch (error) {
      console.log({ error });
      throw error;
    }
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
