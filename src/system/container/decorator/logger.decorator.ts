import { Context, inject } from '@loopback/context';
import { IApplication } from '../../app/application.interface';
import { ILogger } from '../interface/logger.interface';

export function Logger(
  scope?: string,
): (
  target: Object,
  member: string,
  methodDescriptorOrParameterIndex?: number | TypedPropertyDescriptor<unknown>,
) => void {
  return inject(
    'Application',
    {
      decorator: '@Logger',
    },
    async (ctx: Context, injection): Promise<ILogger> =>
      (await ctx.get<IApplication>('Application')).logger.child({
        scope: scope ?? (injection.target as Function).name,
      }),
  );
}
