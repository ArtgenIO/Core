import { Exception } from '../../../../app/exceptions/exception';
import { Dialect } from '../../interface/dialect.type';

export const parseDialect = (dsn: string): Dialect => {
  let protocol: string = new URL(dsn).protocol.replace(':', '').toLowerCase();

  if (protocol === 'postgresql') {
    protocol = 'postgres';
  }

  if (
    ['mongodb', 'postgres', 'mysql', 'mariadb', 'sqlite'].includes(protocol)
  ) {
    return protocol as Dialect;
  } else {
    throw new Exception(`Unknown dialect [${protocol}]`);
  }
};
