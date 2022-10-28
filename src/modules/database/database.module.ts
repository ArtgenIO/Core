import {
  EventModule,
  IKernel,
  ILogger,
  IModule,
  Logger,
  Module,
} from '@hisorange/kernel';
import { BlueprintModule } from '../blueprint/blueprint.module';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { TransformerModule } from '../transformer/transformer.module';
import { DatabaseObserver } from './database.observer';
import { ContentMeiliIndexLambda } from './lambda/meili/index.lambda';
import { DatabaseConnectionConcrete } from './provider/connection-concrete.provider';
import { CrudService } from './service/crud.service';
import { DatabaseConnectionService } from './service/database-connection.service';
import { DatabaseService } from './service/database.service';
import { KeyValueService } from './service/key-value.service';
import { SchemaService } from './service/schema.service';
import { ISchema } from './types/schema.interface';
import { SchemaRef } from './types/system-ref.enum';

@Module({
  imports: [BlueprintModule, TransformerModule, TelemetryModule],
  dependsOn: [EventModule],
  providers: [
    CrudService,
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
  }

  async onStop(kernel: IKernel): Promise<void> {
    await (await kernel.get(DatabaseService)).shutdown();
  }
}
