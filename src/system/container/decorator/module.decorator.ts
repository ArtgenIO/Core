import { Constructor } from '@loopback/context';
import { ClassDecoratorFactory } from '@loopback/metadata';

export const MODULE_KEY = 'artgen:module';

export type IModuleMeta = {
  providers?: Constructor<unknown>[];
  imports?: Constructor<unknown>[];
};

export function Module(meta?: IModuleMeta) {
  return ClassDecoratorFactory.createDecorator<IModuleMeta>(
    MODULE_KEY,
    meta ?? {},
    {
      decoratorName: '@Module',
    },
  );
}
