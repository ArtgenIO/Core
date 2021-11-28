import { BindingScope, injectable } from '@loopback/context';

export const Scheduler = () => {
  return injectable(binding => {
    binding.inScope(BindingScope.SINGLETON).tag('scheduler');
  });
};
