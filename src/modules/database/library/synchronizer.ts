import { DepGraph } from 'dependency-graph';
import { diff } from 'just-diff';
import { Knex } from 'knex';
import { isEqual, snakeCase } from 'lodash';
import hash from 'object-hash';
import { inspect } from 'util';
import { ILogger, Logger } from '../../../app/container';
import { FieldTag, FieldType, ISchema } from '../../schema';
import { RelationKind } from '../../schema/interface/relation.interface';
import { isIndexed, isPrimary } from '../../schema/util/field-tools';
import { IConnection } from '../interface';
import { Inspector } from './inspector/inspector';
import { parseDialect } from './parser/parse-dialect';
import { toSchema } from './transformer/to-schema';
import { toStructure } from './transformer/to-structure';

interface ChangeStep {
  type: 'backup' | 'copy' | 'create' | 'constraint' | 'foreign' | 'drop';
  query: Knex.SchemaBuilder;
}

const fColumns = (s: ISchema) => (ref: string[]) =>
  s.fields.filter(f => ref.includes(f.reference)).map(f => f.columnName);

const getPKCols = (schema: ISchema) =>
  schema.fields.filter(isPrimary).map(f => f.columnName);

export class Synchronizer {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}

  async sync(link: IConnection) {
    const instructions: ChangeStep[] = [];

    // Reduce the associations to only the changed schemas.
    const changes: ISchema[] = Array.from(link.getAssications().values())
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
    const dependencies = this.getDependencyGraph(changes);

    // TODO validate the schema for sanity,
    // - types match their foreign keys
    // - remote tables exits
    // - changed fields require conversion
    // - has unique
    // - index for foreign key in local
    // - unique for foreign key targe

    const inspector = new Inspector(link.knex, parseDialect(link.database.dsn));
    const currentTables = await inspector.tables();
    const isSchemaExits = (s: ISchema) => currentTables.includes(s.tableName);

    for (const schema of changes) {
      // Imported / protected schemas are not synchronized.
      if (!schema || schema.tags.includes('readonly')) {
        continue;
      }
      this.logger.debug('Synchornizing [%s] schema', schema.reference);

      if (!isSchemaExits(schema)) {
        instructions.push(...(await this.createTable(schema, link, inspector)));
        instructions.push(...this.createRelations(schema, link));
      } else {
        instructions.push(
          ...(await this.doAlterTable(schema, link, inspector)),
        );
      }

      link.getAssications().get(schema.reference).inSync = true;
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

    this.logger.info('Synchronized');
  }

  protected async doAlterTable(
    schema: ISchema,
    link: IConnection,
    inspector: Inspector,
  ): Promise<ChangeStep[]> {
    const instructions: ChangeStep[] = [];

    const columns = await inspector.columns(schema.tableName);
    const foreignKeys = await inspector.foreignKeys(schema.tableName);
    const uniques = await inspector.uniques(schema.tableName);

    // TODO need to read the unique sets from the table
    const revSchema = await toSchema(
      schema.database,
      schema.tableName,
      columns,
      foreignKeys,
      uniques,
      link,
      inspector,
    );

    const revStruct = toStructure(revSchema, inspector.dialect);
    const knownStruct = toStructure(schema, inspector.dialect);

    if (!isEqual(revStruct, knownStruct)) {
      // const alterQuery = connection.schema.table(schema.tableName, table => {});
      const changes = diff(revStruct, knownStruct);

      for (const change of changes) {
        // Field has been removed
        if (change.op === 'remove' && change.path[0] === 'fields') {
          instructions.push({
            type: 'drop',
            query: link.knex.schema.alterTable(schema.tableName, t =>
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

  protected async createTable(
    schema: ISchema,
    link: IConnection,
    inspector: Inspector,
  ): Promise<ChangeStep[]> {
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
        if (inspector.dialect === 'postgres') {
          enumExists = await inspector.isTypeExists(typeName);
        } else {
          enumExists = false;
        }

        typeChecks.set(f.reference, {
          exists: enumExists,
          name: typeName,
        });
      }
    }

    instructions.push({
      type: 'create',
      query: link.knex.schema.createTable(schema.tableName, table => {
        for (const f of schema.fields) {
          let col: Knex.ColumnBuilder;

          // MySQL requires length for TEXT, BLOB if indexed
          if (inspector.dialect == 'mysql') {
            if (
              isIndexed(f) ||
              schema.uniques.some(unq => unq.fields.includes(f.reference)) ||
              schema.relations.some(
                rel =>
                  (rel.kind == RelationKind.BELONGS_TO_MANY ||
                    rel.kind == RelationKind.BELONGS_TO_ONE) &&
                  rel.localField == f.reference,
              )
            ) {
              if (f.type == FieldType.BLOB || f.type == FieldType.TEXT) {
                if (!f.typeParams?.length) {
                  f.typeParams.length = 255;
                }
              }
            }
          }

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
              let textLength: string | number = 'text';

              switch (f.typeParams?.length) {
                case 'medium':
                  textLength = 'mediumtext';
                  break;
                case 'long':
                  textLength = 'longtext';
                  break;
                default:
                  textLength = f.typeParams.length;
                  break;
              }

              if (typeof textLength === 'number') {
                col = table.string(f.columnName, textLength);
              } else {
                col = table.text(f.columnName, textLength);
              }

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
            let canHaveDefault = true;

            // Simple, MySQL does not allow default for those types ~
            if (inspector.dialect === 'mysql') {
              if (
                [
                  FieldType.BLOB,
                  FieldType.TEXT,
                  FieldType.JSON,
                  FieldType.JSONB,
                ].includes(f.type)
              ) {
                canHaveDefault = false;
              }
            }

            if (canHaveDefault) {
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
        }
      }),
    });

    instructions.push({
      type: 'constraint',
      query: link.knex.schema.alterTable(schema.tableName, table => {
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

  protected createRelations(schema: ISchema, link: IConnection): ChangeStep[] {
    return [
      {
        type: 'foreign',
        query: link.knex.schema.alterTable(schema.tableName, table => {
          schema.relations.forEach(rel => {
            /**
             * @example Product belongsTo Category, local field is Product.category_id remote field is Category.id
             * @example User hasOne Avatar, local field is User.id remote field is Avatar.user_id
             * @example Customer hasMany Order, local field is Customer.id remote field is Order.customer_id
             */
            if (rel.kind == RelationKind.BELONGS_TO_ONE) {
              const target = link.getSchema(rel.target);

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
        }),
      },
    ];
  }

  protected getDependencyGraph(schemas: ISchema[]): DepGraph<void> {
    const dependencies: DepGraph<void> = new DepGraph({
      circular: true,
    });

    schemas.forEach(s => dependencies.addNode(s.reference));

    for (const localSchema of schemas) {
      if (localSchema.relations) {
        for (const rel of localSchema.relations) {
          const remoteSchema = schemas.find(s => s.reference === rel.target);

          if (rel.kind === RelationKind.BELONGS_TO_ONE) {
            dependencies.addDependency(
              localSchema.reference,
              remoteSchema.reference,
            );
          } else if (rel.kind === RelationKind.BELONGS_TO_MANY) {
            dependencies.addDependency(
              localSchema.reference,
              remoteSchema.reference,
            );
          }
        }
      }
    }

    return dependencies;
  }
}
