import { FastifyInstance } from 'fastify';
import { ILogger, IModule, Logger, Module } from '../../app/container';
import { IKernel } from '../../app/kernel';
import { BlueprintModule } from '../blueprint/blueprint.module';
import { FlowModule } from '../flow/flow.module';
import { PageModule } from '../page/page.module';
import { HttpObserver } from './http.observer';
import { DnsQueryLambda } from './lambda/dns-query.lambda';
import { HttpRequestLambda } from './lambda/http-request.lambda';
import { HttpTerminateLambda } from './lambda/http-terminate.lambda';
import { HttpTriggerLambda } from './lambda/http-trigger.lambda';
import { HttpServerProvider } from './provider/http.server';
import { HttpService } from './service/http.service';

@Module({
  dependsOn: [FlowModule, BlueprintModule, PageModule],
  providers: [
    HttpObserver,
    HttpService,
    HttpTriggerLambda,
    HttpRequestLambda,
    HttpTerminateLambda,
    DnsQueryLambda,
    HttpServerProvider,
  ],
})
export class HttpModule implements IModule {
  constructor(
    @Logger()
    protected logger: ILogger,
  ) {}

  async onStart(kernel: IKernel): Promise<void> {
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
