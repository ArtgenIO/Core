import { BindingScope, injectable } from '@loopback/context';

export const Observer = () => {
  return injectable(binding => {
    binding.inScope(BindingScope.SINGLETON).tag('observer');
  });
};
