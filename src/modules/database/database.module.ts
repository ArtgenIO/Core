import { IModule, Inject, Module } from '../../app/container';
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
  constructor(
    @Inject(DatabaseService)
    protected service: DatabaseService,
  ) {}

  async onStart(): Promise<void> {
    return this.service.bootstrap();
  }

  async onStop() {
    return this.service.shutdown();
  }
}
