import { FastifyInstance } from 'fastify';
import { ServiceBroker } from 'moleculer';
import { HttpServerProvider, IRpcGateway, RpcServerProvider } from '.';
import {
  IContext,
  ILogger,
  IModule,
  Inject,
  Logger,
  Module,
} from '../container';
import { DatabaseModule } from '../database/database.module';
import { IKernel } from '../kernel/interface/kernel.interface';
import { ServerObserver } from './server.observer';
import { ServerService } from './service/server.service';

@Module({
  dependsOn: [DatabaseModule],
  providers: [
    HttpServerProvider,
    RpcServerProvider,
    ServerService,
    ServerObserver,
  ],
})
export class ServerModule implements IModule {
  constructor(
    @Logger()
    protected logger: ILogger,
    @Inject(ServerService)
    protected service: ServerService,
  ) {}

  async onStart(application: IKernel): Promise<void> {
    await Promise.all([
      this.startRpcServer(application.context),
      this.service.startHttpServer(),
    ]);
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
    const http = await app.context.get<FastifyInstance>(
      'providers.HttpServerProvider',
    );

    // Deregister gateways.
    await this.service.stopHttpServer();

    await Promise.all([
      rpc.stop().then(() => this.logger.info('RPC server stopped')),
      http.close().then(() => this.logger.info('HTTP server stopped')),
    ]);
  }
}
