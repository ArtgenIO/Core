import { Knex } from 'knex';
import { Dialect } from '../interface/dialect.type';

export const getDialect = (connection: Knex): Dialect =>
  connection.queryBuilder().client.config.dialect as Dialect;
