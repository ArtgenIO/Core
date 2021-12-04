import { Knex } from 'knex';
import { FieldTag, FieldType, ISchema } from '../../../schema';
import { isPrimary } from '../../../schema/util/field-tools';
import { IDatabaseLink } from '../../interface';
import { QueryInstruction } from './query-plan';

const getPKCols = (schema: ISchema) =>
  schema.fields.filter(isPrimary).map(f => f.columnName);

export const createTable = (
  schema: ISchema,
  link: IDatabaseLink,
): QueryInstruction[] => {
  const instructions: QueryInstruction[] = [];

  instructions.push({
    type: 'create',
    query: link.connection.schema.createTable(schema.tableName, table => {
      schema.fields.forEach(f => {
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
            let textLength = 'text';

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
            col = table.enum(f.columnName, f.typeParams.values);
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
      });
    }),
  });

  instructions.push({
    type: 'constraint',
    query: link.connection.schema.alterTable(schema.tableName, table => {
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
    }),
  });

  return instructions;
};
