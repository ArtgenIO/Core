import { IModule, Module } from '../../system/container';
import { CrudService } from './service/crud.service';

@Module({
  providers: [CrudService],
})
export class CrudModule implements IModule {}
