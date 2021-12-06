import { IModule, Inject, Module } from '../../app/container';
import { BlueprintModule } from '../blueprint/blueprint.module';
import { SchemaModule } from '../schema/collection.module';
import { DatabaseObserver } from './database.observer';
import { ConnectionConcrete } from './provider/connection-concrete.provider';
import { ConnectionService } from './service/connection.service';
import { DatabaseService } from './service/database.service';

@Module({
  imports: [BlueprintModule, SchemaModule],
  providers: [
    ConnectionConcrete,
    ConnectionService,
    DatabaseObserver,
    DatabaseService,
  ],
})
export class DatabaseModule implements IModule {
  constructor(@Inject(DatabaseService) protected service: DatabaseService) {}

  async onStart(): Promise<void> {
    await this.service.bootstrap();
  }

  async onStop(): Promise<void> {
    await this.service.shutdown();
  }
}
