import { Module } from '../../app/container';
import { ODataGateway } from './odata.gateway';
import { ODataService } from './odata.service';

@Module({
  providers: [ODataGateway, ODataService],
})
export class ODataModule {}
