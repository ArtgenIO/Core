import { Dialect } from 'sequelize';

export interface IDatabase {
  /**
   * Readonly unique name, used as an identifier.
   */
  readonly name: string;

  /**
   * Connection URL, with protocol and credentials if needed.
   *
   * @example postgres://user:pass@host.tld:5432/dbname
   * @example mysql://user:pass@host.tld:3306/dbname
   * @example :memory:
   */
  dsn: string;

  /**
   * Database type, used by the ORM to identify which driver to load for the connection.
   */
  type: Dialect;
}
