import { ILogger } from '@hisorange/kernel';
import { diff } from 'just-diff';
import { Knex } from 'knex';
import { Column } from 'knex-schema-inspector/dist/types/column';
import camelCase from 'lodash.camelcase';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import snakeCase from 'lodash.snakecase';
import startCase from 'lodash.startcase';
import upperFirst from 'lodash.upperfirst';
import hash from 'object-hash';
import { inspect } from 'util';
import { ISchema } from '../../models/schema.interface';
import { BaseException } from '../exceptions/base.exception';
import { isPrimary } from '../library/field-tools';
import { createEmptySchema } from '../library/get-new-schema';
import { toStructure } from '../library/to-structure';
import { IDatabaseConnection } from '../types/database-connection.interface';
import { FieldTag } from '../types/field-tags.enum';
import { FieldType } from '../types/field-type.enum';
import { IField } from '../types/field.interface';
import { IEnumeratorStructure } from '../types/inspector/enumerator-structure.interface';
import { IRelation, RelationType } from '../types/relation.interface';
import { DatabaseInspector } from './inspector';

interface ChangeStep {
  type:
    | 'backup'
    | 'copy'
    | 'create'
    | 'constraint'
    | 'foreign'
    | 'drop'
    | 'alter';
  query: Knex.SchemaBuilder;
}

// Find column names
const fColumns = (s: ISchema) => (ref: string[]) =>
  s.fields.filter(f => ref.includes(f.reference)).map(f => f.columnName);

const getPKCols = (schema: ISchema) =>
  schema.fields.filter(isPrimary).map(f => f.columnName);

export class DatabaseSynchronizer {
  readonly inspector: DatabaseInspector;

  constructor(
    readonly logger: ILogger,
    readonly connection: IDatabaseConnection,
  ) {
    this.inspector = new DatabaseInspector(this.connection);
  }

  /**
   * Used in testing for now.
   */
  async deleteTable(tableName: string) {
    await this.connection.knex.schema.dropTableIfExists(tableName);
  }

  /**
   * Read the database for tables which are not synchronized from a schema.
   */
  async importUnknownSchemas(): Promise<ISchema[]> {
    const knownSchemas = this.connection.getSchemas();
    const unknownTables = (await this.inspector.tables()).filter(
      table => !knownSchemas.some(s => s.tableName === table),
    );

    return (
      await Promise.all(
        unknownTables.map(tableName => this.getSchemaFromTable(tableName)),
      )
    ).map(s => {
      // Mark the schema as imported
      s.tags.push('readonly');

      return s;
    });
  }

  async sync(): Promise<number> {
    let changeQueries = 0;

    const startAt = Date.now();
    const instructions: ChangeStep[] = [];

    // Reduce the associations to only the changed schemas.
    const changes: ISchema[] = Array.from(this.connection.associations.values())
      .filter(association => !association.inSync)
      .map(association => association.schema);

    // Nothing has changed, skip early.
    if (!changes.length) {
      return changeQueries;
    }

    // Dependency tree is used to remove foreign keys
    // when we drop a table we need to know if the any other table
    // is dependent on it. If so, then the user has to remove the dependency first.
    //
    // Or when we change a column and we plan to drop it, because the type will not match???
    // Or when the column is removed from the schema but still on the db!
    //const dependencies = this.getDependencyGraph(changes);

    // TODO validate the schema for sanity,
    // - types match their foreign keys
    // - remote tables exits
    // - changed fields require conversion
    // - has unique
    // - index for foreign key in local
    // - unique for foreign key targe

    const currentTables = await this.inspector.tables();
    const isSchemaExits = (s: ISchema) => currentTables.includes(s.tableName);

    for (const schema of changes) {
      // Imported / protected schemas are not synchronized.
      if (!schema || schema.tags.includes('readonly')) {
        this.logger.debug('Skipping on imported [%s] schema', schema.reference);

        continue;
      }
      this.logger.debug('Processing [%s] schema', schema.reference);
      const dialected = this.connection.toDialectSchema(cloneDeep(schema));

      if (!isSchemaExits(dialected)) {
        instructions.push(...(await this.createTable(dialected)));
        instructions.push(...this.createRelations(dialected));
      } else {
        instructions.push(...(await this.doAlterTable(dialected)));
      }

      this.connection.associations.get(dialected.reference).inSync = true;
    }

    const order: ChangeStep['type'][] = [
      'backup',
      'copy',
      'create',
      'constraint',
      'foreign',
      'drop',
      'alter',
    ];

    for (const phase of order) {
      const queries = instructions
        .filter(i => i.type === phase)
        .map(i => i.query)
        .filter(q => !!q.toQuery());

      this.logger.info(
        'Phase [%s] with [%d] instruction',
        phase,
        queries.length,
      );

      changeQueries += queries.length;

      for (const q of queries) {
        this.logger.debug('SQL [%s]', q.toQuery());

        await q;
      }
    }

    this.logger.info('Finished in [%d] ms', Date.now() - startAt);

    return changeQueries;
  }

  protected async doAlterTable(schema: ISchema): Promise<ChangeStep[]> {
    const instructions: ChangeStep[] = [];

    const knownSchema = this.connection.toDialectSchema(cloneDeep(schema));
    const revSchema = this.connection.toDialectSchema(
      await this.getSchemaFromTable(schema.tableName),
    );

    const revStruct = toStructure(revSchema);
    const knownStruct = toStructure(knownSchema);

    if (!isEqual(revStruct, knownStruct)) {
      const changes = diff(revStruct, knownStruct);
      const alterColumns: string[] = [];
      const typeChecks = await this.buildTypeChecks(schema);

      for (const change of changes) {
        // Field has been altered
        if (change.path[0] === 'columns' && change.path.length > 2) {
          if (alterColumns.includes(change.path[1] as string)) {
            continue;
          } else {
            alterColumns.push(change.path[1] as string);
          }

          // Replace a column
          const changedField = knownSchema.fields.find(
            f => f.columnName == change.path[1],
          );

          instructions.push({
            type: 'alter',
            query: this.connection.knex.schema.alterTable(
              knownSchema.tableName,
              t => this.addColumn(t, changedField, typeChecks).alter(),
            ),
          });
        }
        // Removes a column
        else if (
          change.op === 'remove' &&
          change.path[0] === 'columns' &&
          change.path.length == 2
        ) {
          instructions.push({
            type: 'drop',
            query: this.connection.knex.schema.alterTable(
              knownSchema.tableName,
              t => t.dropColumn(change.path[1] as string),
            ),
          });
        }
        // Adds a new column
        else if (
          change.op === 'add' &&
          change.path[0] === 'columns' &&
          change.path.length == 2
        ) {
          const newField = knownSchema.fields.find(
            f => f.columnName == change.path[1],
          );

          instructions.push({
            type: 'create',
            query: this.connection.knex.schema.alterTable(
              knownSchema.tableName,
              table => this.addColumn(table, newField, typeChecks),
            ),
          });
        }
        // Adds missing relationship
        else if (
          change.op === 'add' &&
          change.path[0] === 'relations' &&
          change.path.length == 2
        ) {
          const newRelation = knownSchema.relations.find(
            rel =>
              rel.target === change.value.target &&
              rel.localField == change.value.localField &&
              rel.remoteField == change.value.remoteField,
          );

          if (!newRelation) {
            this.logger.error('New relation [%s]', change.value);

            throw new BaseException('Could not find the new relation!');
          }

          instructions.push({
            type: 'foreign',
            query: this.connection.knex.schema.alterTable(
              knownSchema.tableName,
              table => this.addRelation(table, schema, newRelation),
            ),
          });
        } else {
          console.log('Struct mismatch!', changes);
          console.log('Known', inspect(knownStruct, false, 4, true));
          console.log('Reversed', inspect(revStruct, false, 4, true));
          if (1) process.exit(1);
        }
      }
    }

    return instructions;
  }

  protected addColumn(
    table: Knex.TableBuilder,
    f: IField,
    typeChecks: Map<string, { exists: boolean; name: string }>,
  ) {
    let col: Knex.ColumnBuilder;

    switch (f.type) {
      case FieldType.BOOLEAN:
        col = table.boolean(f.columnName);
        break;
      case FieldType.DATETIME:
        col = table.datetime(f.columnName);
        break;
      case FieldType.DATEONLY:
        col = table.date(f.columnName);
        break;
      case FieldType.TIME:
        col = table.time(f.columnName);
        break;

      case FieldType.JSON:
        col = table.json(f.columnName);
        break;
      case FieldType.TEXT:
        let textLength: string = 'text';

        switch (f.args?.length) {
          case 'tiny':
            textLength = 'tinytext';
            break;
          case 'medium':
            textLength = 'mediumtext';
            break;
          case 'long':
            textLength = 'longtext';
            break;
        }

        if (textLength === 'tinytext') {
          col = table.specificType(f.columnName, 'tinytext');
        } else {
          col = table.text(f.columnName, textLength);
        }

        break;
      case FieldType.UUID:
        col = table.uuid(f.columnName);
        break;
      case FieldType.STRING:
        let stringLength: number;

        if (f.args?.length) {
          if (typeof f.args.length === 'number') {
            stringLength = f.args.length;
          }
        }

        col = table.string(f.columnName, stringLength);
        break;

      // Integers >
      case FieldType.TINYINT:
        col = table.tinyint(f.columnName);
        break;
      case FieldType.SMALLINT:
        col = table.specificType(f.columnName, 'smallint');
        break;
      case FieldType.MEDIUMINT:
        col = table.specificType(f.columnName, 'mediumint');
        break;
      case FieldType.INTEGER:
        col = table.integer(
          f.columnName,
          (f.args.length as number) ?? undefined,
        );
        break;
      case FieldType.BIGINT:
        col = table.bigInteger(f.columnName);
        break;
      // Integers &

      case FieldType.FLOAT:
        col = table.float(f.columnName);
        break;
      case FieldType.REAL:
      case FieldType.DOUBLE:
        col = table.double(f.columnName);
        break;
      case FieldType.DECIMAL:
        col = table.decimal(f.columnName, f.args.precision, f.args.scale);
        break;
      case FieldType.BLOB:
        col = table.binary(f.columnName);
        break;
      case FieldType.ENUM:
        const typeFor = typeChecks.get(f.reference);

        col = table.enum(f.columnName, f.args.values, {
          useNative: true,
          enumName: typeFor?.name,
          existingType: typeFor.exists,
        });

        break;
      case FieldType.JSONB:
        col = table.jsonb(f.columnName);
        break;
      case FieldType.HSTORE:
        col = table.specificType(f.columnName, 'HSTORE');
        break;
      case FieldType.CHAR:
        let charLength: number;

        if (f.args?.length) {
          if (typeof f.args.length === 'number') {
            charLength = f.args.length;
          }
        }

        col = table.specificType(
          f.columnName,
          'char' + (charLength ? `(${charLength})` : ''),
        );
        break;
      case FieldType.CIDR:
        col = table.specificType(f.columnName, 'CIDR');
        break;
      case FieldType.INET:
        col = table.specificType(f.columnName, 'INET');
        break;
      case FieldType.MACADDR:
        col = table.specificType(f.columnName, 'MACADDR');
        break;
      default:
        throw new BaseException(`Unhandled type [${f.type}]`);
    }

    // Field modifiers
    if (f.args?.unsigned) {
      col = col.unsigned();
    }

    // Add nullable
    if (f.tags.includes(FieldTag.NULLABLE) || f.defaultValue === null) {
      col = col.nullable();
    } else {
      col = col.notNullable();
    }

    if (f.defaultValue !== undefined) {
      if (f.defaultValue === null) {
        col.defaultTo(null);
      } else {
        const defType = typeof f.defaultValue;

        switch (defType) {
          case 'boolean':
          case 'number':
          case 'string':
            col.defaultTo(f.defaultValue as string);
            break;
          case 'object':
            col.defaultTo(JSON.stringify(f.defaultValue));
            break;
        }
      }
    }

    return col;
  }

  protected async buildTypeChecks(
    schema: ISchema,
  ): Promise<Map<string, { exists: boolean; name: string }>> {
    const typeChecks = new Map<string, { exists: boolean; name: string }>();

    for (const f of schema.fields) {
      if (f.type === FieldType.ENUM) {
        let enumExists = false;
        const curValues = f.args.values.sort((a, b) => (a > b ? 1 : -1));
        const typeHash = hash(curValues, {
          algorithm: 'md5',
          encoding: 'hex',
        });
        const typeName = `__artgen_enum_${snakeCase(
          schema.reference,
        )}_${typeHash}`;

        // In PG we have to check for the type,
        if (this.connection.dialect === 'postgres') {
          enumExists = await this.inspector.isTypeExists(typeName);
        }

        typeChecks.set(f.reference, {
          exists: enumExists,
          name: typeName,
        });
      }
    }

    return typeChecks;
  }

  protected async createTable(schema: ISchema): Promise<ChangeStep[]> {
    const instructions: ChangeStep[] = [];
    const typeChecks = await this.buildTypeChecks(schema);

    instructions.push({
      type: 'create',
      query: this.connection.knex.schema.createTable(
        schema.tableName,
        table => {
          for (const f of schema.fields) {
            this.addColumn(table, f, typeChecks);
          }
        },
      ),
    });

    instructions.push({
      type: 'constraint',
      query: this.connection.knex.schema.alterTable(schema.tableName, table => {
        schema.fields.forEach(f => {
          // Add index
          if (f.tags.includes(FieldTag.INDEX)) {
            table.index(f.columnName);
          }

          // Add unique
          if (f.tags.includes(FieldTag.UNIQUE)) {
            table.unique([f.columnName]);
          }
        });

        table.primary(getPKCols(schema));

        schema.uniques.forEach(unq => {
          table.unique(unq.fields);
        });
      }),
    });

    return instructions;
  }

  protected createRelations(schema: ISchema): ChangeStep[] {
    return [
      {
        type: 'foreign',
        query: this.connection.knex.schema.alterTable(
          schema.tableName,
          table => {
            schema.relations.forEach(rel => {
              this.addRelation(table, schema, rel);
            });

            // Searching for relations which refers to this schema.
            const schemas = this.connection.getSchemas();

            schemas.forEach(remoteSchema => {
              remoteSchema.relations.forEach(rel => {
                // Backward link toward this schema
                if (
                  rel.kind === RelationType.BELONGS_TO_MANY &&
                  rel.target === schema.reference
                ) {
                  const through = this.connection.getSchema(rel.through);

                  table
                    .foreign(fColumns(remoteSchema)([rel.remoteField]))
                    .references(fColumns(through)([rel.throughRemoteField]))
                    .inTable(through.tableName);
                }
              });
            });
          },
        ),
      },
    ];
  }

  protected addRelation(
    table: Knex.CreateTableBuilder,
    schema: ISchema,
    rel: IRelation,
  ) {
    /**
     * @example Product belongsTo Category, local field is Product.category_id remote field is Category.id
     * @example User hasOne Avatar, local field is User.id remote field is Avatar.user_id
     * @example Customer hasMany Order, local field is Customer.id remote field is Order.customer_id
     */
    if (rel.kind == RelationType.BELONGS_TO_ONE) {
      const target = this.connection.getSchema(rel.target);

      table
        .foreign(fColumns(schema)([rel.localField]))
        .references(fColumns(target)([rel.remoteField]))
        .inTable(target.tableName);
    }

    /**
     * @example Product hasManyThroughMany Orders through the OrderEntry, local field is Product.id -> OrderEntry.product_id && OrderEntry.order_id -> Order.id
     */
    if (rel.kind == RelationType.BELONGS_TO_MANY) {
      const through = this.connection.getSchema(rel.through);

      table
        .foreign(fColumns(schema)([rel.localField]))
        .references(fColumns(through)([rel.throughLocalField]))
        .inTable(through.tableName);
    }
  }

  /**
   * Build a schema for the given database table.
   */
  protected async getSchemaFromTable(tableName: string): Promise<ISchema> {
    // Prepare an empty schema for the findings.
    const schema = createEmptySchema(this.connection.database.ref);

    // Configure the meta, and known facts.
    schema.reference = upperFirst(snakeCase(tableName));
    schema.title = upperFirst(startCase(tableName));
    schema.tableName = tableName;
    schema.fields = [];

    // Fetch common informations.
    const columns = await this.inspector.columns(tableName);
    const foreignKeys = await this.inspector.foreignKeys(tableName);
    const uniques = await this.inspector.uniques(tableName);
    const columnUniques = uniques
      .filter(unq => unq.columns.length === 1)
      .map(unq => unq.columns[0]);

    const enums: IEnumeratorStructure[] = [];

    // SQLite uses enum with value checks so we need to find every enum like check ~
    enums.push(...(await this.inspector.enumerators(tableName, columns)));

    for (const col of columns) {
      const field: IField = {
        title: upperFirst(startCase(col.name)),
        reference: camelCase(col.name),
        columnName: col.name,
        defaultValue: col.default_value,
        meta: {},
        type: FieldType.STRING,
        args: {},
        tags: [],
      };

      // Enumerators have to be reversed.
      const enumFix = enums.find(e => e.column == field.columnName);

      if (enumFix) {
        field.type = FieldType.ENUM;
        field.args.values = enumFix.values;
      } else {
        const revType = await this.getFieldType(tableName, col);
        field.type = revType.type;
        field.args = revType.args;
      }

      if (col.is_primary_key) {
        field.tags.push(FieldTag.PRIMARY);
      }

      if (col.is_nullable) {
        field.tags.push(FieldTag.NULLABLE);
      }

      if (col.is_unique || columnUniques.includes(col.name)) {
        field.tags.push(FieldTag.UNIQUE);
      }

      schema.fields.push(field);
    }

    foreignKeys.forEach(foreign => {
      const target = this.connection
        .getSchemas()
        .find(s => s.tableName === foreign.foreign_key_table);
      const localField = schema.fields.find(
        f => f.columnName == foreign.column,
      );
      const remoteField = target.fields.find(
        f => f.columnName === foreign.foreign_key_column,
      );
      const remotePKs = target.fields.filter(isPrimary);
      // When the remote has multiple PKs then it must be a connection table
      // TODO do reverse checks to see which other table has FK on the target table to determin who is the real target in M:M
      const kind =
        remotePKs.length === 1
          ? RelationType.BELONGS_TO_ONE
          : RelationType.BELONGS_TO_MANY;

      // TODO: this needs to be investigated, we need to build graphs from foreign keys and check those with two edges in between
      const relation: any = {
        name: foreign.constraint_name,
        kind,
        target: target.reference,
        localField: localField.reference,
        remoteField: remoteField.reference,
        through: undefined,
      };

      schema.relations.push(relation);
    });

    uniques
      .filter(unq => unq.columns.length > 1)
      .forEach(cuniq => {
        schema.uniques.push({
          name: cuniq.name.replace(schema.tableName, ''),
          fields: cuniq.columns.map(
            col => schema.fields.find(f => f.columnName === col).reference,
          ),
        });
      });

    return schema;
  }

  protected async getFieldType(
    tableName: string,
    column: Column,
  ): Promise<Pick<IField, 'type' | 'args'>> {
    let type: FieldType;
    let args: IField['args'] = {};

    if (column.numeric_precision !== null) {
      args.precision = column.numeric_precision;
    }

    if (column.numeric_scale !== null) {
      args.scale = column.numeric_scale;
    }

    if (column.max_length !== null) {
      args.length = column.max_length;
    }

    const text = column.data_type.toUpperCase();

    // Simple types
    switch (text) {
      case 'CHARACTER VARYING':
      case 'VARCHAR':
        type = FieldType.STRING;
        break;

      case 'BOOLEAN':
        type = FieldType.BOOLEAN;
        break;
      case 'BYTEA':
        type = FieldType.BLOB;
        args.binary = true;
        break;
      case 'CIDR':
        type = FieldType.CIDR;
        break;
      case 'DATE':
        type = FieldType.DATEONLY;
        break;
      case 'DOUBLE PRECISION':
        type = FieldType.DOUBLE;
        break;
      case 'INET':
        type = FieldType.INET;
        break;

      case 'JSON':
        type = FieldType.JSON;
        break;

      case 'JSONB':
        type = FieldType.JSONB;
        break;
      case 'MACADDR':
        type = FieldType.MACADDR;
        break;
      case 'NUMERIC':
        type = FieldType.DECIMAL;
      case 'REAL':
        type = FieldType.REAL;
        break;
      case 'SMALLINT':
        type = FieldType.SMALLINT;
        break;
      case 'TEXT':
        type = FieldType.TEXT;
        break;
      case 'TIME WITHOUT TIME ZONE':
      case 'TIME WITH TIME ZONE':
        type = FieldType.TIME;
        break;
      case 'TIMESTAMP WITHOUT TIME ZONE':
      case 'TIMESTAMP WITH TIME ZONE':
      case 'DATETIME':
        type = FieldType.DATETIME;
        break;
      case 'UUID':
        type = FieldType.UUID;
        break;
      case 'ENUM':
        type = FieldType.ENUM;
        break;
      case 'BLOB':
        type = FieldType.BLOB;
        break;
      case 'TINYTEXT':
        type = FieldType.TEXT;
        args.length = 'tiny';
        break;
      case 'MEDIUMTEXT':
        type = FieldType.TEXT;
        args.length = 'medium';
        break;
      case 'LONGTEXT': // MariaDB JSON?
        type = FieldType.TEXT;
        args.length = 'long';

        // MariaDB uses LONGTEXT with json check to store JSON
        if (this.connection.dialect === 'mariadb') {
          const isJson = await this.inspector.isJson(tableName, column.name);

          if (isJson) {
            type = FieldType.JSON;
            delete args.length;
          }
        }

        break;
      case 'CHARACTER':
        type = FieldType.CHAR;
        break;
      case 'FLOAT':
        type = FieldType.FLOAT;
        break;
      case 'TINYINT':
        type = FieldType.TINYINT;
        break;
      case 'TINYINT UNSIGNED':
        type = FieldType.TINYINT;
        args.unsigned = true;
        break;
      case 'SMALLINT UNSIGNED':
        type = FieldType.SMALLINT;
        args.unsigned = true;
        break;
      case 'MEDIUMINT UNSIGNED':
        type = FieldType.MEDIUMINT;
        args.unsigned = true;
        break;
      case 'INT UNSIGNED':
        type = FieldType.INTEGER;
        args.unsigned = true;
        break;
      case 'BIGINT UNSIGNED':
        type = FieldType.BIGINT;
        args.unsigned = true;
        break;
      case 'MEDIUMINT':
        type = FieldType.MEDIUMINT;
        break;
      case 'BIGINT':
        type = FieldType.BIGINT;
        break;
      case 'INTEGER':
      case 'INT':
        type = FieldType.INTEGER;
        break;
    }

    if (!type) {
      const VCHAR_PATTERN = /CHARACTER VARYING\((\d+)\)/;

      // VARCHAR
      if (text.match(VCHAR_PATTERN)) {
        type = FieldType.STRING;
        args.length = parseInt(text.match(VCHAR_PATTERN)[1], 10);
      }

      const CHAR_PATTERN = /CHARACTER\((\d+)\)/;
      // CHAR
      if (text.match(CHAR_PATTERN)) {
        type = FieldType.CHAR;
        args.length = parseInt(text.match(CHAR_PATTERN)[1], 10);
      }
    }

    // SQLITE uses CHAR for binary
    if (text == 'CHAR') {
      if (column.max_length == 36) {
        type = FieldType.UUID;
        args = {};
      } else {
        type = FieldType.CHAR;
      }
    }

    if (!type) {
      throw new BaseException(`Unknown type [${text}]`);
    }

    return { type, args: args };
  }
}
