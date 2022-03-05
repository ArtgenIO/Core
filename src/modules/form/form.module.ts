import { IModule, Module } from '../../app/container';
import { moduleRef } from '../../app/container/module-ref';
import { DatabaseModule } from '../database/database.module';

@Module({
  dependsOn: [moduleRef(() => DatabaseModule)],
  providers: [],
})
export class FormModule implements IModule {}
