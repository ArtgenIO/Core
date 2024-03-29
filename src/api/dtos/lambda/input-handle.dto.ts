import { JSONSchema7Definition } from 'json-schema';
import { ILambdaHandle } from '../../types/lambda-handle.interface';

export class LambdaInputHandleDTO implements ILambdaHandle {
  readonly direction = 'input';

  constructor(
    readonly id: string,
    readonly schema: JSONSchema7Definition = null,
  ) {}
}
