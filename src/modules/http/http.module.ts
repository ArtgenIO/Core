import { FastifyInstance } from 'fastify';
import { ILogger, IModule, Logger, Module } from '../../app/container';
import { IKernel } from '../../app/kernel';
import { ExtensionModule } from '../blueprint/extension.module';
import { LogicModule } from '../logic/workflow.module';
import { PageModule } from '../page/page.module';
import { HttpObserver } from './http.observer';
import { HttpRequestLambda } from './lambda/http-request.lambda';
import { HttpTerminateLambda } from './lambda/http-terminate.lambda';
import { HttpTriggerLambda } from './lambda/http-trigger.lambda';
import { HttpServerProvider } from './provider/http.server';
import { HttpService } from './service/http.service';

@Module({
  dependsOn: [LogicModule, ExtensionModule, PageModule],
  providers: [
    HttpObserver,
    HttpService,
    HttpTriggerLambda,
    HttpRequestLambda,
    HttpTerminateLambda,
    HttpServerProvider,
  ],
})
export class HttpModule implements IModule {
  constructor(
    @Logger()
    protected logger: ILogger,
  ) {}

  async onReady(kernel: IKernel): Promise<void> {
    await Promise.all([(await kernel.get(HttpService)).startServer()]);
  }

  async onStop(kernel: IKernel) {
    const http = await kernel.context.get<FastifyInstance>(
      'providers.HttpServerProvider',
    );

    // Deregister gateways.
    await (await kernel.get(HttpService)).stopServer();

    await http.close().then(() => this.logger.info('HTTP server stopped'));
  }
}
