import { Module } from '../../app/container';
import { AuthenticationModule } from '../authentication/authentication.module';
import { DatabaseModule } from '../database/database.module';
import { WorkflowHttpGateway } from './gateway/http.gateway';
import { WorkflowRpcGateway } from './gateway/rpc.gateway';
import { WorkflowService } from './service/workflow.service';

@Module({
  dependsOn: [AuthenticationModule, DatabaseModule],
  providers: [WorkflowService, WorkflowHttpGateway, WorkflowRpcGateway],
})
export class WorkflowModule {}
