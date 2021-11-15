import { Module } from '../../system/container';
import { AuthenticationModule } from '../../system/security/authentication/authentication.module';
import { WorkflowHttpGateway } from './gateway/http.gateway';
import { WorkflowRpcGateway } from './gateway/rpc.gateway';
import { WorkflowService } from './service/workflow.service';

@Module({
  dependsOn: [AuthenticationModule],
  providers: [WorkflowService, WorkflowHttpGateway, WorkflowRpcGateway],
})
export class WorkflowModule {}
