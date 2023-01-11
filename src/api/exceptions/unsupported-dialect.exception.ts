import { BaseException } from './base.exception';

export class UnsupportedDialect extends BaseException {
  constructor(dialect: string) {
    super(`Unsupported dialect [${dialect}]`);
  }
}
