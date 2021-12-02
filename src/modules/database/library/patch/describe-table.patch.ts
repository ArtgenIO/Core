import _ from 'lodash';
import { QueryTypes } from 'sequelize';

export async function describeTablePatch(tableName, options) {
  let schema = null;
  let schemaDelimiter = null;

  if (typeof options === 'string') {
    schema = options;
  } else if (typeof options === 'object' && options !== null) {
    schema = options.schema || null;
    schemaDelimiter = options.schemaDelimiter || null;
  }

  if (typeof tableName === 'object' && tableName !== null) {
    schema = tableName.schema;
    tableName = tableName.tableName;
  }

  const sql = this.queryGenerator.describeTableQuery(
    tableName,
    schema,
    schemaDelimiter,
  );
  options = { ...options, type: QueryTypes.DESCRIBE };
  const sqlIndexes = this.queryGenerator.showIndexesQuery(tableName);

  try {
    const data = await this.sequelize.query(sql, options);
    /*
     * If no data is returned from the query, then the table name may be wrong.
     * Query generators that use information_schema for retrieving table info will just return an empty result set,
     * it will not throw an error like built-ins do (e.g. DESCRIBE on MySql).
     */
    if (_.isEmpty(data)) {
      throw new Error(
        `No description found for "${tableName}" table. Check the table name and schema; remember, they _are_ case sensitive.`,
      );
    }

    const indexes = await this.sequelize.query(sqlIndexes, options);
    for (const prop in data) {
      data[prop].unique = false;
    }
    for (const index of indexes) {
      for (const field of index.fields) {
        if (index.unique !== undefined) {
          if (data[field.attribute].primaryKey === false) {
            // !!! PATCH: Should not turn the unique on when the key is a composite primary
            data[field.attribute].unique = index.unique;
          }
        }
      }
    }

    const foreignKeys = await this.getForeignKeyReferencesForTable(
      tableName,
      options,
    );
    for (const foreignKey of foreignKeys) {
      data[foreignKey.columnName].references = {
        model: foreignKey.referencedTableName,
        key: foreignKey.referencedColumnName,
      };
    }

    return data;
  } catch (e) {
    if (
      (e as any).original &&
      (e as any).original.code === 'ER_NO_SUCH_TABLE'
    ) {
      throw new Error(
        `No description found for "${tableName}" table. Check the table name and schema; remember, they _are_ case sensitive.`,
      );
    }

    throw e;
  }
}
