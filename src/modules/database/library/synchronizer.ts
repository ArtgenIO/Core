import createInspector from '@directus/schema';
import { Knex } from 'knex';
import { FieldTag, FieldType as T, ISchema } from '../../schema';
import { isPrimary } from '../../schema/util/is-primary';

const buildCreateTable = (schema: ISchema, connection: Knex) => {
  return connection.schema.createTable(schema.tableName, table => {
    schema.fields.forEach(f => {
      let col: Knex.ColumnBuilder;

      switch (f.type) {
        case T.BOOLEAN:
          col = table.boolean(f.columnName);
          break;
        case T.DATETIME:
          col = table.datetime(f.columnName);
          break;
        case T.DATEONLY:
          col = table.date(f.columnName);
          break;
        case T.TIME:
          col = table.time(f.columnName);
          break;
        case T.INTEGER:
          col = table.integer(
            f.columnName,
            (f.typeParams.length as number) ?? undefined,
          );
          break;
        case T.JSON:
          col = table.json(f.columnName);
          break;
        case T.TEXT:
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
        case T.UUID:
          col = table.uuid(f.columnName);
          break;
        case T.STRING:
          col = table.string(f.columnName);
          break;
        case T.BIGINT:
          col = table.bigInteger(f.columnName);
          break;
        case T.TINYINT:
          col = table.tinyint(f.columnName);
          break;
        case T.SMALLINT:
        case T.MEDIUMINT:
          col = table.integer(f.columnName);
          break;
        case T.FLOAT:
          col = table.float(f.columnName);
          break;
        case T.REAL:
        case T.DOUBLE:
          col = table.double(f.columnName);
          break;
        case T.DECIMAL:
          col = table.decimal(
            f.columnName,
            f.typeParams.precision,
            f.typeParams.scale,
          );
          break;
        case T.BLOB:
          col = table.binary(f.columnName);
          break;
        case T.ENUM:
          col = table.enum(f.columnName, f.typeParams.values);
          break;
        case T.JSONB:
          col = table.jsonb(f.columnName);
          break;
        case T.HSTORE:
          col = table.specificType(f.columnName, 'HSTORE');
          break;
        case T.CIDR:
          col = table.specificType(f.columnName, 'CIDR');
          break;
        case T.INET:
          col = table.specificType(f.columnName, 'INET');
          break;
        case T.MACADDR:
          col = table.specificType(f.columnName, 'MACADDR');
          break;
      }

      // Field modifiers
      if (f.typeParams.unsigned) {
        col = col.unsigned();
      }

      // Add index
      if (f.tags.includes(FieldTag.INDEX)) {
        col = col.index();
      }

      // Add unique
      if (f.tags.includes(FieldTag.UNIQUE)) {
        col = col.unique();
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

      //col.comment(`$ref:${f.reference}`);
    });

    table.primary(schema.fields.filter(isPrimary).map(f => f.columnName));
  });
};

export const synchronize = async (schema: ISchema, connection: Knex) => {
  const inspector = createInspector(connection);
  const isTableExists = await inspector.hasTable(schema.tableName);

  if (!isTableExists) {
    const command = buildCreateTable(schema, connection);

    console.log(command.toString());
    await command;
  }
};
