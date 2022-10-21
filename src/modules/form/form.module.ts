import { IModule, Module, moduleRef } from '@hisorange/kernel';
import { DatabaseModule } from '../database/database.module';

@Module({
  dependsOn: [moduleRef(() => DatabaseModule)],
  providers: [],
})
export class FormModule implements IModule {}
