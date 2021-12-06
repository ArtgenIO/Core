import { IModule, Module } from '../../app/container';
import { moduleRef } from '../../app/container/module-ref';
import { IKernel } from '../../app/kernel';
import { RestModule } from '../rest/rest.module';
import { SchemaModule } from '../schema/schema.module';
import { DatabaseObserver } from './database.observer';
import { ConnectionConcrete } from './provider/connection-concrete.provider';
import { ConnectionService } from './service/connection.service';
import { DatabaseService } from './service/database.service';

@Module({
  imports: [moduleRef(() => SchemaModule), moduleRef(() => RestModule)],
  providers: [
    ConnectionConcrete,
    ConnectionService,
    DatabaseObserver,
    DatabaseService,
  ],
})
export class DatabaseModule implements IModule {
  async onStart(kernel: IKernel): Promise<void> {
    await (await kernel.get(DatabaseService)).bootstrap();
  }

  async onStop(kernel: IKernel): Promise<void> {
    await (await kernel.get(DatabaseService)).shutdown();
  }
}
