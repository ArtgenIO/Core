import { Context, inject } from '@loopback/context';
import { IKernel } from '../../kernel/interface/kernel.interface';
import { ILogger } from '../interface/logger.interface';

export function Logger(
  scope?: string,
): (
  target: Object,
  member: string,
  methodDescriptorOrParameterIndex?: number | TypedPropertyDescriptor<unknown>,
) => void {
  return inject(
    'Kernel',
    {
      decorator: '@Logger',
    },
    async (ctx: Context, injection): Promise<ILogger> =>
      (await ctx.get<IKernel>('Kernel')).logger.child({
        scope: scope ?? (injection.target as Function).name,
      }),
  );
}
