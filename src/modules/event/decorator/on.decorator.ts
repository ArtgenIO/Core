import { MethodDecoratorFactory } from '@loopback/metadata';
import { OnOptions } from 'eventemitter2';

export const ON_META_KEY = 'artgen:on';
export type OnParams = {
  event: string;
  options: OnOptions;
};

export function On(event: string, options: OnOptions = {}) {
  return MethodDecoratorFactory.createDecorator(
    ON_META_KEY,
    {
      event,
      options,
    },
    {
      allowInheritance: true,
      decoratorName: '@On',
    },
  );
}
