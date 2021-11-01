import { JSONSchema7Definition } from 'json-schema';

export interface ILambdaHandle {
  /**
   * In program reference on chaining, unique / node
   */
  readonly id: string;

  /**
   * Handle input validation
   */
  readonly schema: JSONSchema7Definition | null;

  /**
   * Connection limitations output to input
   */
  readonly direction: 'output' | 'input';
}
