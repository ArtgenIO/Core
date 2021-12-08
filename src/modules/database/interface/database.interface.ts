export interface IDatabase {
  /**
   * Human readable title.
   */
  title: string;

  /**
   * Readonly unique name, used as an identifier.
   */
  readonly name: string;

  /**
   * Connection URL, with protocol and credentials if needed.
   *
   * @example postgres://user:pass@host.tld:5432/dbname
   * @example mysql://user:pass@host.tld:3306/dbname
   * @example sqlite::memory:
   */
  dsn: string;
}
