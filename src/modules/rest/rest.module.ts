import { Module } from '../../app/container';
import { moduleRef } from '../../app/container/module-ref';
import { SchemaModule } from '../schema/schema.module';
import { UpgradeModule } from '../upgrade/upgrade.module';
import { RestCreateLambda } from './lambda/rest-create.lambda';
import { RestFindLambda } from './lambda/rest-find.lambda';
import { RestGateway } from './rest.gateway';
import { ODataService } from './service/odata.service';
import { OpenApiService } from './service/openapi.service';
import { RestService } from './service/rest.service';

@Module({
  imports: [moduleRef(() => SchemaModule), UpgradeModule],
  providers: [
    RestService,
    OpenApiService,
    ODataService,
    RestGateway,
    RestCreateLambda,
    RestFindLambda,
  ],
})
export class RestModule {}
