import {
  BindingScope,
  BindingScopeAndTags,
  injectable,
} from '@loopback/context';

export const Service = (config: BindingScopeAndTags = {}) => {
  // Default to the singleton scope
  if (!config.scope) {
    config.scope = BindingScope.SINGLETON;
  }

  return injectable(config);
};
