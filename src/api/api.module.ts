import {
  EventModule,
  IKernel,
  ILogger,
  IModule,
  Logger,
  Module,
  SchedulerModule,
} from '@hisorange/kernel';
import { ISchema } from '../models/schema.interface';
import { ArtgenBlueprintProvider } from './providers/artgen-blueprint.provider';
import { AuthenticationHandlerProvider } from './providers/authentication-handler.provider';
import { AuthenticatorProvider } from './providers/authenticator.provider';
import { DatabaseConnectionConcrete } from './providers/connection-concrete.provider';
import { GatewayProviders } from './providers/gateway.providers';
import { HttpProxyProvider } from './providers/http-proxy.provider';
import { HttpUpstreamProvider } from './providers/http-upstream.provider';
import { LambdaProviders } from './providers/lambda.providers';
import { ObserverProviders } from './providers/observer.providers';
import { ServiceProviders } from './providers/service.providers';
import { TransformeProviders } from './providers/transformer.providers';
import { VersionProvider } from './providers/version.provider';
import { BlueprintService } from './services/blueprint.service';
import { CrudService } from './services/crud.service';
import { DatabaseConnectionService } from './services/database-connection.service';
import { DatabaseService } from './services/database.service';
import { FlowEventService } from './services/flow-event.service';
import { FlowSchedulerService } from './services/flow-scheduler.service';
import { HttpService } from './services/http.service';
import { TelemetryService } from './services/telemetry.service';
import { SchemaRef } from './types/system-ref.enum';

@Module({
  imports: [EventModule, SchedulerModule],
  dependsOn: [],
  providers: [
    ...GatewayProviders,
    ...LambdaProviders,
    ...ObserverProviders,
    ...ServiceProviders,
    ...TransformeProviders,

    ArtgenBlueprintProvider,
    AuthenticationHandlerProvider,
    AuthenticatorProvider,
    DatabaseConnectionConcrete,
    HttpProxyProvider,
    HttpUpstreamProvider,
    VersionProvider,
  ],
})
export class APIModule implements IModule {
  constructor(
    @Logger()
    protected logger: ILogger,
  ) {}

  async onBoot(kernel: IKernel): Promise<void> {
    await (await kernel.get(DatabaseService)).bootstrap();
    await (await kernel.get(BlueprintService)).seed();
    await (await kernel.get(HttpService)).startProxy();
  }

  async onStart(kernel: IKernel): Promise<void> {
    const connections = await Promise.all(
      (await kernel.get(DatabaseConnectionService))
        .findAll()
        .map(connection => connection.synchornizer.importUnknownSchemas()),
    );

    const newSchemas: ISchema[] = [];

    for (const newFinds of connections) {
      newSchemas.push(...newFinds);
    }

    if (newSchemas.length) {
      const crud = await kernel.get(CrudService);

      for (const newSchema of newSchemas) {
        this.logger.info(
          'New schema [%s][%s] discovered!',
          newSchema.database,
          newSchema.reference,
        );
        crud.create('main', SchemaRef.SCHEMA, newSchema);
      }
    }

    await (await kernel.get(HttpService)).createUpstream();
    await (await kernel.get(FlowSchedulerService)).register();
    await (await kernel.get(FlowEventService)).register();
  }

  async onStop(kernel: IKernel): Promise<void> {
    await (
      await kernel.get(HttpService)
    )
      .stopServer()
      .then(() => this.logger.info('HTTP server stopped'))
      .catch(() => {});

    (await kernel.get(FlowSchedulerService)).deregister();
    await (await kernel.get(FlowEventService)).deregister();

    (await kernel.get(TelemetryService)).clearTick();
    await (await kernel.get(DatabaseService)).shutdown();
  }
}
