import { BindingScope, injectable } from '@loopback/context';

export const CTRL_META_KEY = 'artgen:ctrl';

export type IControllerMeta = {
  prefix?: string | string[];
  tags?: string[];
};

export function Controller(meta?: IControllerMeta) {
  return injectable(binding => {
    binding.inScope(BindingScope.SINGLETON).tag('http:controller', {
      meta,
    });
  });
}
