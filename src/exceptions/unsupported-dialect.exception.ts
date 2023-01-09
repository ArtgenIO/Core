import { Exception } from './exception';

export class UnsupportedDialect extends Exception {
  constructor(dialect: string) {
    super(`Unsupported dialect [${dialect}]`);
  }
}
