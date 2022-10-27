import {
  EventModule,
  IKernel,
  ILogger,
  IModule,
  Logger,
  Module,
  moduleRef,
} from '@hisorange/kernel';
import { BlueprintModule } from '../blueprint/blueprint.module';
import { RestModule } from '../rest/rest.module';
import { RestService } from '../rest/service/rest.service';
import { ISchema } from '../schema';
import { SchemaRef } from '../schema/interface/system-ref.enum';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { TransformerModule } from '../transformer/transformer.module';
import { DatabaseObserver } from './database.observer';
import { ContentMeiliIndexLambda } from './lambda/meili/index.lambda';
import { DatabaseConnectionConcrete } from './provider/connection-concrete.provider';
import { DatabaseConnectionService } from './service/database-connection.service';
import { DatabaseService } from './service/database.service';
import { KeyValueService } from './service/key-value.service';
import { SchemaService } from './service/schema.service';

@Module({
  imports: [
    BlueprintModule,
    moduleRef(() => RestModule),
    TransformerModule,
    TelemetryModule,
  ],
  dependsOn: [EventModule],
  providers: [
    DatabaseConnectionConcrete,
    DatabaseConnectionService,
    DatabaseObserver,
    DatabaseService,
    KeyValueService,
    SchemaService,
    ContentMeiliIndexLambda,
  ],
})
export class DatabaseModule implements IModule {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}

  async onBoot(kernel: IKernel): Promise<void> {
    await (await kernel.get(DatabaseService)).bootstrap();
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
      const restService = await kernel.get(RestService);

      for (const newSchema of newSchemas) {
        this.logger.info(
          'New schema [%s][%s] discovered!',
          newSchema.database,
          newSchema.reference,
        );
        restService.create('main', SchemaRef.SCHEMA, newSchema);
      }
    }
  }

  async onStop(kernel: IKernel): Promise<void> {
    await (await kernel.get(DatabaseService)).shutdown();
  }
}
