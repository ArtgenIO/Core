import { ISchema } from '..';
import { Exception } from '../../../app/exceptions/exception';

export const SchemaAnalyzer = (schema: ISchema) => {
  const fieldColumnNameSet = schema.fields.map(f => f.columnName);

  // Verify relations.
  {
    const names = schema.relations.map(r => r.name);
    const namesUnique = new Set(names);

    if (names.length !== namesUnique.size) {
      throw new Exception(`Relation names must be unique`);
    }

    for (const relation of schema.relations) {
      if (relation.localField) {
        if (!fieldColumnNameSet.includes(relation.localField)) {
          throw new Exception(
            `Relation [${relation.name}] local field [${relation.localField}] is not defined`,
          );
        }
      }
    }
  }
};
