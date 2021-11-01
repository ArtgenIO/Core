import config from 'config';
import { FastifyInstance } from 'fastify';
import { ServiceBroker } from 'moleculer';
import {
  HttpServerProvider,
  IHttpGateway,
  IRpcGateway,
  RpcServerProvider,
} from '.';
import { IApplication } from '../app/application.interface';
import { IContext, ILogger, IModule, Logger, Module } from '../container';
import { DatabaseModule } from '../database/database.module';

@Module({
  dependsOn: [DatabaseModule],
  providers: [HttpServerProvider, RpcServerProvider],
})
export class ServerModule implements IModule {
  constructor(
    @Logger()
    protected logger: ILogger,
  ) {}

  async onStart(application: IApplication): Promise<void> {
    await Promise.all([
      this.startRpcServer(application.context),
      this.startHttpServer(application.context),
    ]);
  }

  protected async startRpcServer(ctx: IContext): Promise<void> {
    const server = await ctx.get<ServiceBroker>('providers.RpcServerProvider');

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

  protected async startHttpServer(ctx: IContext): Promise<void> {
    const server = await ctx.get<FastifyInstance>(
      'providers.HttpServerProvider',
    );

    await Promise.all(
      ctx
        .findByTag('http:gateway')
        .map(async gateway =>
          (await ctx.get<IHttpGateway>(gateway.key)).register(server),
        ),
    );

    let port = parseInt(config.get('http.port'), 10);

    // Heroku patch
    if (process.env.PORT) {
      port = parseInt(process.env.PORT, 10);
    }

    await server.listen(port, '0.0.0.0');

    this.logger.info('HTTP server listening at [0.0.0.0:%d]', port);
  }

  async onStop(app: IApplication) {
    const rpc = await app.context.get<ServiceBroker>(
      'providers.RpcServerProvider',
    );
    const http = await app.context.get<FastifyInstance>(
      'providers.HttpServerProvider',
    );

    await Promise.all([
      rpc.stop().then(() => this.logger.info('RPC server stopped')),
      http.close().then(() => this.logger.info('HTTP server stopped')),
    ]);
  }
}
