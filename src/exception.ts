export class Exception extends Error {
  constructor(message: string, readonly context?: any) {
    super(message);
  }
}
