import { FieldOrGroup } from 'react-awesome-query-builder';
import { FieldType, IField } from '../../schema';
import { FieldTool } from '../../schema/util/field-tools';

type IOperator =
  | 'equal'
  | 'not_equal'
  | 'less'
  | 'less_or_equal'
  | 'greater'
  | 'greater_or_equal'
  | 'like'
  | 'not_like'
  | 'starts_with'
  | 'ends_with'
  | 'between'
  | 'not_between'
  | 'is_empty'
  | 'is_not_empty'
  | 'select_equals'
  | 'select_not_equals'
  | 'select_any_in'
  | 'select_not_any_in'
  | 'multiselect_equals'
  | 'multiselect_not_equals'
  | 'proximity'
  | 'some'
  | 'all'
  | 'none';

type IType =
  | 'text'
  | 'number'
  | 'multiselect'
  | 'date'
  | 'time'
  | 'datetime'
  | 'boolean';

export const toFieldFilter = (f: IField): FieldOrGroup | null => {
  const ops: IOperator[] = ['equal', 'not_equal'];
  const isNullable = FieldTool.isNullable(f);
  let type: IType;

  switch (f.type) {
    case FieldType.BOOLEAN:
      type = 'boolean';
      break;
    case FieldType.DATETIME:
      type = 'datetime';
      break;
    case FieldType.DATEONLY:
      type = 'date';
      break;
    case FieldType.TIME:
      type = 'time';
      break;
    case FieldType.JSON:
    case FieldType.JSONB:
    case FieldType.HSTORE:
    case FieldType.BLOB:
      type = 'text';

      if (!isNullable) {
        return null;
      }
      break;
    case FieldType.TEXT:
    case FieldType.STRING:
    case FieldType.CHAR:
    case FieldType.CIDR:
    case FieldType.INET:
    case FieldType.MACADDR:
      type = 'text';
      ops.push(
        'like',
        'not_like',
        'starts_with',
        'ends_with',
        'is_empty',
        'is_not_empty',
      );
      break;
    case FieldType.UUID:
      type = 'text';
      break;

    // Numbers
    case FieldType.INTEGER:
    case FieldType.DOUBLE:
    case FieldType.DECIMAL:
    case FieldType.BIGINT:
    case FieldType.TINYINT:
    case FieldType.SMALLINT:
    case FieldType.MEDIUMINT:
    case FieldType.FLOAT:
    case FieldType.REAL:
      type = 'number';
      ops.push('greater', 'greater_or_equal', 'less', 'less_or_equal');

      break;
    case FieldType.ENUM:
      type = 'multiselect';
      break;
  }

  if (isNullable) {
    ops.push('some', 'none');
  }

  return {
    label: f.title,
    type,
    operators: ops,
    valueSources: ['value'],
  };
};
