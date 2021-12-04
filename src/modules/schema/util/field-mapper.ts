import { Column } from 'knex-schema-inspector/dist/types/column';
import { FieldType, IField } from '..';
import { Exception } from '../../../app/exceptions/exception';

const VCHAR_PATTERN = /CHARACTER VARYING\((\d+)\)/;
const CHAR_PATTERN = /CHARACTER\((\d+)\)/;

export const getFieldTypeFromString = (
  col: Column,
): { type: FieldType; typeParams: IField['typeParams'] } => {
  let type: FieldType;
  let params: IField['typeParams'] = {
    values: [],
  };

  if (col.numeric_precision !== null) params.precision = col.numeric_precision;
  if (col.numeric_scale !== null) params.scale = col.numeric_scale;
  if (col.max_length !== null) params.length = col.max_length;

  const text = col.data_type.toUpperCase();

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
      params.binary = true;
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
    // VARCHAR
    if (text.match(VCHAR_PATTERN)) {
      type = FieldType.STRING;
      params.length = parseInt(text.match(VCHAR_PATTERN)[1], 10);
    }

    // CHAR
    if (text.match(CHAR_PATTERN)) {
      type = FieldType.CHAR;
      params.length = parseInt(text.match(CHAR_PATTERN)[1], 10);
    }
  }

  if (!type) {
    throw new Exception(`Unknown type [${text}]`);
  }

  return { type, typeParams: params };
};
