import { Context, inject } from '@loopback/context';
import { Model, ModelClass } from 'objection';
import { CollectionService } from '../../collection/service/collection.service';

export function InjectModel(
  reference: string,
): (
  target: Object,
  member: string,
  methodDescriptorOrParameterIndex?: number | TypedPropertyDescriptor<unknown>,
) => void {
  return inject(
    CollectionService.name,
    {
      decorator: '@InjectModel',
    },
    async (ctx: Context, injection): Promise<ModelClass<Model>> =>
      (await ctx.get<CollectionService>(CollectionService.name)).getModel(
        'system',
        reference,
      ),
  );
}
