import { IModule, Module } from '../../system/container';
import { CrudGateway } from './gateway/crud.gateway';
import { CrudService } from './service/crud.service';

@Module({
  providers: [CrudService, CrudGateway],
})
export class CrudModule implements IModule {}
