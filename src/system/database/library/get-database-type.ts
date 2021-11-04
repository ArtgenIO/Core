import { DatabaseType } from 'typeorm';

export const getDatabaseTypeFromUrl = (url: string): DatabaseType => {
  if (url === ':memory:') {
    return 'sqlite';
  }

  let protocol: string = new URL(url).protocol.replace(':', '').toLowerCase();

  if (protocol === 'postgresql') {
    protocol = 'postgres';
  }

  if (protocol === 'mariadb') {
    protocol = 'mysql';
  }

  if (['mongodb', 'postgres', 'mysql'].includes(protocol)) {
    return protocol as DatabaseType;
  } else {
    throw new Error(`Unsupported database type [${protocol}]`);
  }
};
