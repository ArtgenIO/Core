import { Module } from '@hisorange/kernel';
import { UpgradeModule } from '../upgrade/upgrade.module';
import { RestCreateLambda } from './lambda/rest-create.lambda';
import { RestFindLambda } from './lambda/rest-find.lambda';
import { RestGateway } from './rest.gateway';
import { ODataService } from './service/odata.service';
import { OpenApiService } from './service/openapi.service';
import { RestService } from './service/rest.service';
import { SearchService } from './service/search.service';

@Module({
  imports: [UpgradeModule],
  providers: [
    RestService,
    OpenApiService,
    ODataService,
    RestGateway,
    RestCreateLambda,
    RestFindLambda,
    SearchService,
  ],
})
export class RestModule {}
