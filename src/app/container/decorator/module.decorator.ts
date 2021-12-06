import { Constructor } from '@loopback/context';
import { ClassDecoratorFactory } from '@loopback/metadata';

export const MODULE_KEY = 'artgen:module';

export type IModuleMeta = {
  /**
   * Injectable services
   */
  providers?: Constructor<unknown>[];

  /**
   * Resource dependencies provided by the imported modules,
   * not context locked, but builds up a requirement for injections
   */
  imports?: Constructor<unknown>[];

  /**
   * Modules used in the module as a dependency,
   * this enforces the rule that the module cannot start until the dependency is ready.
   */
  dependsOn?: Constructor<unknown>[];
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
