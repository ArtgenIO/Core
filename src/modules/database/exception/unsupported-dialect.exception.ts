import { Exception } from '../../../app/exceptions/exception';

export class UnsupportedDialect extends Exception {
  constructor(dialect: string) {
    super(`Unsupported dialect [${dialect}]`);
  }
}
