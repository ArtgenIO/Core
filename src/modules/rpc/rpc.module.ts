import { ServiceBroker } from 'moleculer';
import { IRpcGateway, RpcServerProvider } from '.';
import {
  IContext,
  ILogger,
  IModule,
  Logger,
  Module,
} from '../../app/container';
import { moduleRef } from '../../app/container/module-ref';
import { IKernel } from '../../app/kernel/interface/kernel.interface';
import { DatabaseModule } from '../database/database.module';

@Module({
  dependsOn: [moduleRef(() => DatabaseModule)],
  providers: [RpcServerProvider],
})
export class RpcModule implements IModule {
  constructor(
    @Logger()
    protected logger: ILogger,
  ) {}

  async onStart(kernel: IKernel): Promise<void> {
    await Promise.all([this.startRpcServer(kernel.context)]);
  }

  protected async startRpcServer(ctx: IContext): Promise<void> {
    const server = await ctx.get<ServiceBroker>(ServiceBroker.name);

    await Promise.all(
      ctx
        .findByTag('rpc:gateway')
        .map(async gateway =>
          (await ctx.get<IRpcGateway>(gateway.key)).register(server),
        ),
    );

    await server.start();

    this.logger.info('RPC server connected as [%s]', server.nodeID);
  }

  async onStop(app: IKernel) {
    const rpc = await app.context.get<ServiceBroker>(ServiceBroker.name);
    await rpc.stop().then(() => this.logger.info('RPC server stopped'));
  }
}
