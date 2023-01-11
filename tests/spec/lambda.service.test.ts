import { IContext, Service } from '@hisorange/kernel';
import {
  Context,
  createBindingFromClass,
  instantiateClass,
} from '@loopback/context';
import { LambdaService } from '../../src/api/services/lambda.service';

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
