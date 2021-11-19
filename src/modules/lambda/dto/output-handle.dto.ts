import { JSONSchema7Definition } from 'json-schema';
import { ILambdaHandle } from '../interface/handle.interface';

export class OutputHandleDTO implements ILambdaHandle {
  readonly direction = 'output';

  constructor(
    readonly id: string,
    readonly schema: JSONSchema7Definition = null,
  ) {}
}
