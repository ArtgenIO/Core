import { Context, inject } from '@loopback/context';
import { Model, ModelClass } from 'objection';
import { SchemaService } from '../../schema/service/schema.service';

export function InjectModel(
  reference: string,
): (
  target: Object,
  member: string,
  methodDescriptorOrParameterIndex?: number | TypedPropertyDescriptor<unknown>,
) => void {
  return inject(
    SchemaService.name,
    {
      decorator: '@InjectModel',
    },
    async (ctx: Context, injection): Promise<ModelClass<Model>> =>
      (await ctx.get<SchemaService>(SchemaService.name)).getModel(
        'system',
        reference,
      ),
  );
}
