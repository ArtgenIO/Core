import { Constructor } from '@loopback/context';
import { IModule, ModuleResolver } from '.';

export const forwardRef = (
  resolve: () => Constructor<IModule>,
): ModuleResolver => ({
  resolve,
});
