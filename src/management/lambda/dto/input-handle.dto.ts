import { JSONSchema7Definition } from 'json-schema';
import { ILambdaHandle } from '../interface/handle.interface';

export class InputHandleDTO implements ILambdaHandle {
  readonly direction = 'input';

  constructor(
    readonly id: string,
    readonly schema: JSONSchema7Definition = null,
  ) {}
}
