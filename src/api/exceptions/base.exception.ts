export class BaseException extends Error {
  constructor(message: string, readonly context?: any) {
    super(message);
  }
}
