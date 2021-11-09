import { IModule, Module } from '../../system/container';
import { CrudGateway } from './gateway/crud.gateway';
import { CrudCreateLambda } from './lambda/crud-create.lambda';
import { CrudService } from './service/crud.service';

@Module({
  providers: [CrudService, CrudGateway, CrudCreateLambda],
})
export class CrudModule implements IModule {}
