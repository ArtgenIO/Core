import { IModule, Module } from '../../system/container';
import { SchemaModule } from '../schema/schema.module';
import { CrudGateway } from './gateway/crud.gateway';
import { ODataGateway } from './gateway/odata.gateway';
import { RestGateway } from './gateway/rest.gateway';
import { CrudCreateLambda } from './lambda/crud-create.lambda';
import { CrudService } from './service/crud.service';
import { ODataService } from './service/odata.service';
import { RestService } from './service/rest.service';

@Module({
  dependsOn: [SchemaModule],
  providers: [
    CrudService,
    CrudGateway,
    CrudCreateLambda,
    ODataService,
    ODataGateway,
    RestGateway,
    RestService,
  ],
})
export class CrudModule implements IModule {}
