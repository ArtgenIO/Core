import { diff } from 'just-diff';
import { Knex } from 'knex';
import { Column } from 'knex-schema-inspector/dist/types/column';
import {
  camelCase,
  cloneDeep,
  isEqual,
  snakeCase,
  startCase,
  upperFirst,
} from 'lodash';
import hash from 'object-hash';
import { inspect } from 'util';
import { ILogger } from '../../../app/container';
import { Exception } from '../../../app/exceptions/exception';
import { FieldTag, FieldType, IField, ISchema } from '../../schema';
import {
  IRelation,
  RelationKind,
} from '../../schema/interface/relation.interface';
import { isPrimary } from '../../schema/util/field-tools';
import { createEmptySchema } from '../../schema/util/get-new-schema';
import { IDatabaseConnection, IEnumeratorStructure } from '../interface';
import { DatabaseInspector } from './database.inspector';

interface ChangeStep {
  type: 'backup' | 'copy' | 'create' | 'constraint' | 'foreign' | 'drop';
  query: Knex.SchemaBuilder;
}

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

  async sync() {
    const startAt = Date.now();
    const instructions: ChangeStep[] = [];

    // Reduce the associations to only the changed schemas.
    const changes: ISchema[] = Array.from(this.connection.associations.values())
      .filter(association => !association.inSync)
      .map(association => association.schema);

    // Nothing has changed, skip early.
    if (!changes.length) {
      return;
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

      queries.forEach(q => console.log('--SQL:\t', q.toQuery()));

      await Promise.all(queries);
    }

    this.logger.info('Finished in [%d] ms', Date.now() - startAt);
  }

  protected async doAlterTable(schema: ISchema): Promise<ChangeStep[]> {
    const instructions: ChangeStep[] = [];

    const revSchema = this.connection.toDialectSchema(
      await this.toSchema(schema.tableName),
    );

    const revStruct = this.connection.toStructure(revSchema);
    const knownStruct = this.connection.toStructure(schema);

    if (!isEqual(revStruct, knownStruct)) {
      // const alterQuery = connection.schema.table(schema.tableName, table => {});
      const changes = diff(revStruct, knownStruct);

      for (const change of changes) {
        // Field has been removed
        if (change.op === 'remove' && change.path[0] === 'fields') {
          instructions.push({
            type: 'drop',
            query: this.connection.knex.schema.alterTable(schema.tableName, t =>
              t.dropColumn(revStruct.columns[change.path[1]].columnName),
            ),
          });
        }
      }

      console.log('Struct mismatch!', changes);
      console.log('Known', inspect(knownStruct, false, 4, true));
      console.log('Reversed', inspect(revStruct, false, 4, true));

      if (1) process.exit(1);
    }

    return instructions;
  }

  protected async createTable(schema: ISchema): Promise<ChangeStep[]> {
    const instructions: ChangeStep[] = [];
    const typeChecks = new Map<string, { exists: boolean; name: string }>();

    for (const f of schema.fields) {
      if (f.type === FieldType.ENUM) {
        let enumExists = false;
        const curValues = f.typeParams.values.sort((a, b) => (a > b ? 1 : -1));
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

    instructions.push({
      type: 'create',
      query: this.connection.knex.schema.createTable(
        schema.tableName,
        table => {
          for (const f of schema.fields) {
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
              case FieldType.INTEGER:
                col = table.integer(
                  f.columnName,
                  (f.typeParams.length as number) ?? undefined,
                );
                break;
              case FieldType.JSON:
                col = table.json(f.columnName);
                break;
              case FieldType.TEXT:
                let textLength: string = 'text';

                switch (f.typeParams?.length) {
                  case 'medium':
                    textLength = 'mediumtext';
                    break;
                  case 'long':
                    textLength = 'longtext';
                    break;
                }

                col = table.text(f.columnName, textLength);
                break;
              case FieldType.UUID:
                col = table.uuid(f.columnName);
                break;
              case FieldType.STRING:
                col = table.string(f.columnName);
                break;
              case FieldType.BIGINT:
                col = table.bigInteger(f.columnName);
                break;
              case FieldType.TINYINT:
                col = table.tinyint(f.columnName);
                break;
              case FieldType.SMALLINT:
              case FieldType.MEDIUMINT:
                col = table.integer(f.columnName);
                break;
              case FieldType.FLOAT:
                col = table.float(f.columnName);
                break;
              case FieldType.REAL:
              case FieldType.DOUBLE:
                col = table.double(f.columnName);
                break;
              case FieldType.DECIMAL:
                col = table.decimal(
                  f.columnName,
                  f.typeParams.precision,
                  f.typeParams.scale,
                );
                break;
              case FieldType.BLOB:
                col = table.binary(f.columnName);
                break;
              case FieldType.ENUM:
                const typeFor = typeChecks.get(f.reference);

                col = table.enum(f.columnName, f.typeParams.values, {
                  useNative: true,
                  enumName: typeFor.name,
                  existingType: typeFor.exists,
                });

                break;
              case FieldType.JSONB:
                col = table.jsonb(f.columnName);
                break;
              case FieldType.HSTORE:
                col = table.specificType(f.columnName, 'HSTORE');
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
                throw new Exception(`Unhandled type [${f.type}]`);
            }

            // Field modifiers
            if (f.typeParams.unsigned) {
              col = col.unsigned();
            }

            // Add nullable
            if (f.tags.includes(FieldTag.NULLABLE) || f.defaultValue === null) {
              col = col.nullable();
            } else {
              col = col.notNullable();
            }

            if (f.defaultValue !== undefined) {
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
              /**
               * @example Product belongsTo Category, local field is Product.category_id remote field is Category.id
               * @example User hasOne Avatar, local field is User.id remote field is Avatar.user_id
               * @example Customer hasMany Order, local field is Customer.id remote field is Order.customer_id
               */
              if (rel.kind == RelationKind.BELONGS_TO_ONE) {
                const target = this.connection.getSchema(rel.target);

                table
                  .foreign(fColumns(schema)([rel.localField]))
                  .references(fColumns(target)([rel.remoteField]))
                  .inTable(target.tableName);
              }

              /**
               * @example Product hasManyThroughMany Orders through the OrderEntry, local field is Product.id -> OrderEntry.product_id && OrderEntry.order_id -> Order.id
               */
              if (rel.kind == RelationKind.BELONGS_TO_MANY) {
                // TODO implement
              }
            });
          },
        ),
      },
    ];
  }

  /**
   * Build a schema for the given database table.
   */
  protected async toSchema(tableName: string): Promise<ISchema> {
    // Prepare an empty schema for the findings.
    const schema = createEmptySchema(this.connection.database.name);

    // Configure the meta, and known facts.
    schema.reference = upperFirst(snakeCase(tableName));
    schema.label = upperFirst(startCase(tableName));
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
        label: upperFirst(startCase(col.name)),
        reference: camelCase(col.name),
        columnName: col.name,
        defaultValue: col.default_value,
        type: FieldType.STRING,
        typeParams: {
          values: [],
        },
        tags: [],
      };

      // Enumerators have to be reversed.
      const enumFix = enums.find(e => e.column == field.columnName);

      if (enumFix) {
        field.type = FieldType.ENUM;
        field.typeParams.values = enumFix.values;
      } else {
        const revType = this.getFieldType(col);
        field.type = revType.type;
        field.typeParams = revType.typeParams;
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
          ? RelationKind.BELONGS_TO_ONE
          : RelationKind.BELONGS_TO_MANY;

      const relation: IRelation = {
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

  protected getFieldType(column: Column): Pick<IField, 'type' | 'typeParams'> {
    let type: FieldType;
    let typeParams: IField['typeParams'] = {
      values: [],
    };

    if (column.numeric_precision !== null) {
      typeParams.precision = column.numeric_precision;
    }

    if (column.numeric_scale !== null) {
      typeParams.scale = column.numeric_scale;
    }

    if (column.max_length !== null) {
      typeParams.length = column.max_length;
    }

    const text = column.data_type.toUpperCase();

    // Simple types
    switch (text) {
      case 'CHARACTER VARYING':
      case 'VARCHAR':
        type = FieldType.STRING;
        break;
      case 'BIGINT':
        type = FieldType.BIGINT;
        break;
      case 'BOOLEAN':
        type = FieldType.BOOLEAN;
        break;
      case 'BYTEA':
        type = FieldType.STRING;
        typeParams.binary = true;
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
      case 'INTEGER':
        type = FieldType.INTEGER;
        break;
      case 'JSON':
      case 'LONGTEXT': // MariaDB
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
    }

    if (!type) {
      const VCHAR_PATTERN = /CHARACTER VARYING\((\d+)\)/;

      // VARCHAR
      if (text.match(VCHAR_PATTERN)) {
        type = FieldType.STRING;
        typeParams.length = parseInt(text.match(VCHAR_PATTERN)[1], 10);
      }

      const CHAR_PATTERN = /CHARACTER\((\d+)\)/;
      // CHAR
      if (text.match(CHAR_PATTERN)) {
        type = FieldType.CHAR;
        typeParams.length = parseInt(text.match(CHAR_PATTERN)[1], 10);
      }
    }

    // SQLITE uses CHAR for binary
    if (text == 'CHAR') {
      if (column.max_length == 36) {
        type = FieldType.UUID;
        typeParams = {
          values: [],
        };
      } else {
        type = FieldType.TEXT;
      }
    }

    if (!type) {
      throw new Exception(`Unknown type [${text}]`);
    }

    return { type, typeParams };
  }
}
