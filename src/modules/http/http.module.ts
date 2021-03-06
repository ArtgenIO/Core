import { FastifyInstance } from 'fastify';
import { ILogger, IModule, Logger, Module } from '../../app/container';
import { IKernel } from '../../app/kernel';
import { BlueprintModule } from '../blueprint/blueprint.module';
import { RestModule } from '../rest/rest.module';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { ReverseProxyGateway } from './gateway/reverse-proxy.gateway';
import { HttpObserver } from './http.observer';
import { DnsQueryLambda } from './lambda/dns-query.lambda';
import { HttpRequestLambda } from './lambda/http-request.lambda';
import { HttpTerminateLambda } from './lambda/http-terminate.lambda';
import { HttpTriggerLambda } from './lambda/http-trigger.lambda';
import { HttpProxyProvider } from './provider/http-proxy.provider';
import { HttpUpstreamProvider } from './provider/http-upstream.provider';
import { HttpService } from './service/http.service';

@Module({
  dependsOn: [BlueprintModule, RestModule],
  imports: [TelemetryModule],
  providers: [
    HttpObserver,
    HttpService,
    HttpTriggerLambda,
    HttpRequestLambda,
    HttpTerminateLambda,
    DnsQueryLambda,
    HttpUpstreamProvider,
    HttpProxyProvider,
    ReverseProxyGateway,
  ],
})
export class HttpModule implements IModule {
  constructor(
    @Logger()
    protected logger: ILogger,
  ) {}

  async onBoot(kernel: IKernel): Promise<void> {
    const svc = await kernel.get(HttpService);
    await svc.startProxy();
  }

  async onStart(kernel: IKernel): Promise<void> {
    const svc = await kernel.get(HttpService);
    await svc.createUpstream();
  }

  async onStop(kernel: IKernel) {
    const http = await kernel.context.get<FastifyInstance>(
      'providers.HttpProxyProvider',
    );

    // Deregister gateways.
    await (await kernel.get(HttpService)).stopServer();

    await http.close().then(() => this.logger.info('HTTP server stopped'));
  }
}
