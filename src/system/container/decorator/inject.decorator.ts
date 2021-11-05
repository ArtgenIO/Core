import {
  BindingSelector,
  Constructor,
  inject,
  InjectionMetadata,
  ResolverFunction,
} from '@loopback/context';

type InjectDecorator = (
  bindingSelector: BindingSelector | Constructor<object>,
  metadata?: InjectionMetadata,
  resolve?: ResolverFunction,
) => (
  target: Object,
  member: string | undefined,
  methodDescriptorOrParameterIndex?:
    | number
    | TypedPropertyDescriptor<any>
    | undefined,
) => void;

export const Inject: InjectDecorator = function (
  bindingSelector: BindingSelector | Constructor<object>,
  metadata?: InjectionMetadata,
  resolve?: ResolverFunction,
) {
  if (typeof bindingSelector === 'function') {
    if (bindingSelector?.name) {
      bindingSelector = bindingSelector.name as BindingSelector;
    }
  }

  return inject(bindingSelector as BindingSelector, metadata, resolve);
};
