import { MethodDecoratorFactory } from '@loopback/metadata';
import { OnOptions } from 'eventemitter2';

type Options = OnOptions & {
  debounce?: number;
};

export const ON_META_KEY = 'artgen:on';
export type OnParams = {
  event: string;
  options: Options;
};

export function On(event: string, options: Options = {}) {
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
