import {
  BindingScope,
  BindingScopeAndTags,
  Constructor,
  injectable,
} from '@loopback/context';

export const Service = (
  config: BindingScopeAndTags | Constructor<unknown> | any = {},
) => {
  if (typeof config === 'function' && config?.name) {
    return injectable(binding => {
      binding.inScope(BindingScope.SINGLETON).tag({
        product: config?.name,
      });
    });
  }

  // Default to the singleton scope
  if (!config.scope) {
    config.scope = BindingScope.SINGLETON;
  }

  return injectable(config);
};
