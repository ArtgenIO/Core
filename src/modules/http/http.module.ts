import { FastifyInstance } from 'fastify';
import { ILogger, IModule, Inject, Logger, Module } from '../../app/container';
import { IKernel } from '../../app/kernel';
import { ExtensionModule } from '../extension/extension.module';
import { PageModule } from '../page/page.module';
import { WorkflowModule } from '../workflow/workflow.module';
import { HttpObserver } from './http.observer';
import { HttpRequestLambda } from './lambda/http-request.lambda';
import { HttpTerminateLambda } from './lambda/http-terminate.lambda';
import { HttpTriggerLambda } from './lambda/http-trigger.lambda';
import { HttpServerProvider } from './provider/http.server';
import { HttpService } from './service/http.service';

@Module({
  dependsOn: [WorkflowModule, ExtensionModule, PageModule],
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
    @Inject(HttpService)
    protected service: HttpService,
  ) {}

  async onStart(): Promise<void> {
    await Promise.all([this.service.startServer()]);
  }

  async onStop(kernel: IKernel) {
    const http = await kernel.context.get<FastifyInstance>(
      'providers.HttpServerProvider',
    );

    // Deregister gateways.
    await this.service.stopServer();

    await http.close().then(() => this.logger.info('HTTP server stopped'));
  }
}
