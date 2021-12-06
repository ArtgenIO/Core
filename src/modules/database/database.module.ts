import { IModule, Module } from '../../app/container';
import { IKernel } from '../../app/kernel';
import { DatabaseObserver } from './database.observer';
import { ConnectionConcrete } from './provider/connection-concrete.provider';
import { ConnectionService } from './service/connection.service';
import { DatabaseService } from './service/database.service';

@Module({
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
