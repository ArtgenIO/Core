import { Constructor } from '@loopback/context';
import { IModule, ModuleResolver } from '.';

export const moduleRef = (
  resolve: () => Constructor<IModule>,
): ModuleResolver => ({
  resolve,
});
