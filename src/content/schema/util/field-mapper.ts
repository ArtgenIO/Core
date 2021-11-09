import { DataType, DataTypes } from 'sequelize';
import { FieldType, IField } from '..';
import { Exception } from '../../../exception';

export const getDataTypeFromField = (f: IField): DataType => {
  // Map single types
  switch (f.type) {
    case FieldType.BOOLEAN:
      return DataTypes.BOOLEAN;
    case FieldType.DATETIME:
      return DataTypes.DATE;
    case FieldType.TIME:
      return DataTypes.TIME;
    case FieldType.DATEONLY:
      return DataTypes.DATEONLY;
    case FieldType.JSON:
      return DataTypes.JSON;
    case FieldType.UUID:
      return DataTypes.UUID;
    // PG only
    case FieldType.HSTORE:
      return DataTypes.HSTORE;
    case FieldType.JSONB:
      return DataTypes.JSONB;
    case FieldType.CIDR:
      return DataTypes.CIDR;
    case FieldType.INET:
      return DataTypes.INET;
    case FieldType.MACADDR:
      return DataTypes.MACADDR;
  }

  if (f.type === FieldType.STRING) {
    return DataTypes.STRING(
      f.typeParams?.length as number,
      f.typeParams?.binary,
    );
  }

  if (f.type === FieldType.ENUM) {
    return DataTypes.ENUM(...f.typeParams.values);
  }

  if (f.type === FieldType.CHAR) {
    return DataTypes.CHAR(f.typeParams?.length as number, f.typeParams?.binary);
  }

  if (f.type === FieldType.TEXT) {
    if (f.typeParams?.length) {
      if (typeof f.typeParams.length === 'string') {
        return DataTypes.TEXT({
          length: f.typeParams.length,
        });
      }
    }

    return DataTypes.TEXT;
  }

  if (f.type === FieldType.BLOB) {
    if (f.typeParams?.length) {
      if (typeof f.typeParams.length === 'string') {
        return DataTypes.BLOB({
          length: f.typeParams.length,
        });
      }
    }

    return DataTypes.BLOB;
  }

  if (f.type === FieldType.TINYINT) {
    return DataTypes.TINYINT({
      length: (f.typeParams?.length as number) ?? undefined,
      zerofill: f.typeParams?.zerofill ?? undefined,
      unsigned: f.typeParams?.unsigned ?? undefined,
    });
  }

  if (f.type === FieldType.SMALLINT) {
    return DataTypes.SMALLINT({
      length: (f.typeParams?.length as number) ?? undefined,
      zerofill: f.typeParams?.zerofill ?? undefined,
      unsigned: f.typeParams?.unsigned ?? undefined,
    });
  }

  if (f.type === FieldType.MEDIUMINT) {
    return DataTypes.MEDIUMINT({
      length: (f.typeParams?.length as number) ?? undefined,
      zerofill: f.typeParams?.zerofill ?? undefined,
      unsigned: f.typeParams?.unsigned ?? undefined,
    });
  }

  if (f.type === FieldType.INTEGER) {
    return DataTypes.INTEGER({
      length: (f.typeParams?.length as number) ?? undefined,
      zerofill: f.typeParams?.zerofill ?? undefined,
      unsigned: f.typeParams?.unsigned ?? undefined,
    });
  }

  if (f.type === FieldType.BIGINT) {
    return DataTypes.BIGINT({
      length: (f.typeParams?.length as number) ?? undefined,
      zerofill: f.typeParams?.zerofill ?? undefined,
      unsigned: f.typeParams?.unsigned ?? undefined,
    });
  }

  if (f.type === FieldType.FLOAT) {
    return DataTypes.FLOAT({
      length: (f.typeParams?.length as number) ?? undefined,
      decimals: f.typeParams?.decimals ?? undefined,
    });
  }

  if (f.type === FieldType.REAL) {
    return DataTypes.REAL({
      length: (f.typeParams?.length as number) ?? undefined,
      decimals: f.typeParams?.decimals ?? undefined,
    });
  }

  if (f.type === FieldType.DOUBLE) {
    return DataTypes.DOUBLE({
      length: (f.typeParams?.length as number) ?? undefined,
      decimals: f.typeParams?.decimals ?? undefined,
    });
  }

  if (f.type === FieldType.DECIMAL) {
    return DataTypes.DECIMAL({
      scale: f.typeParams?.scale ?? undefined,
      precision: f.typeParams?.precision ?? undefined,
    });
  }

  throw new Exception(`Unhandled type [${f.type}] conversion`);
};

const VCHAR_PATTERN = /CHARACTER VARYING\((\d+)\)/;
const CHAR_PATTERN = /CHARACTER\((\d+)\)/;

export const getFieldTypeFromString = (
  text: string,
  special: string[],
): { type: FieldType; params: IField['typeParams'] } => {
  let type: FieldType;
  let params: IField['typeParams'] = {
    values: [],
  };

  // Simple types
  switch (text) {
    case 'CHARACTER VARYING':
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
      params.values = special;
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

  return { type, params };
};
