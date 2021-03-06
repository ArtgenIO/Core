import {
  Context,
  createBindingFromClass,
  instantiateClass,
} from '@loopback/context';
import { IContext, Service } from '../../../app/container';
import { LambdaService } from './lambda.service';

describe('LambdaService', () => {
  let ctx: IContext;

  beforeEach(() => {
    ctx = new Context('test');

    @Service({
      tags: 'lambda',
    })
    class NodeA {}

    @Service({
      tags: 'lambda',
    })
    class NodeB {}

    ctx.add(createBindingFromClass(NodeA));
    ctx.add(createBindingFromClass(NodeB));
    ctx.add(createBindingFromClass(LambdaService));
  });

  test.skip('should return the services tagged with the node keyword', async () => {
    const instance = await instantiateClass(LambdaService, ctx);

    expect(instance).toBeDefined();
    expect(instance.findAll()).toBeInstanceOf(Array);
    expect(instance.findAll().length).toBe(2);
  });
});
