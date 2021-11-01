import {
  BindingScope,
  Context,
  createBindingFromClass,
} from '@loopback/context';
import { IContext } from '..';
import { Service } from './service.decorator';

describe('@Service', () => {
  let ctx: IContext;

  beforeEach(() => {
    ctx = new Context('test');
  });

  test('should set the default scope to singleton', () => {
    @Service()
    class testSingleton {}

    const binding = createBindingFromClass(testSingleton);

    expect(binding.key).toBe('classes.testSingleton');
    expect(binding.scope).toBe(BindingScope.SINGLETON);
  });
});
