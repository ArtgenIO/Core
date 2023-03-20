import { JSONSchema7Definition } from 'json-schema';
import { ILambdaHandle } from '../../types/lambda-handle.interface';

export class LambdaOutputHandleDTO implements ILambdaHandle {
  readonly direction = 'output';

  constructor(
    readonly id: string,
    readonly schema: JSONSchema7Definition = null,
  ) {}
}
