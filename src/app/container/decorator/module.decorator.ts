import { Constructor } from '@loopback/context';
import { ClassDecoratorFactory } from '@loopback/metadata';
import { IModule } from '..';

export const MODULE_KEY = 'artgen:module';

export type ModuleResolver = { resolve: () => Constructor<IModule> };
export type ModuleConcrete = Constructor<IModule> | ModuleResolver;

export type IModuleMeta = {
  /**
   * Injectable services
   */
  providers?: Constructor<unknown>[];

  /**
   * Modules used in the module as a dependency,
   * this enforces the rule that the module cannot start until the dependency is ready.
   */
  dependsOn?: ModuleConcrete[];

  /**
   *
   */
  imports?: ModuleConcrete[];
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
