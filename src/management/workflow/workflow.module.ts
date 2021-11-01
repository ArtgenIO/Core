import { Module } from '../../system/container';
import { WorkflowHttpGateway } from './gateway/http.gateway';
import { WorkflowRpcGateway } from './gateway/rpc.gateway';
import { ReadWorkflowLambda } from './lambda/read-workflow.lambda';
import { WorkflowService } from './service/workflow.service';

@Module({
  providers: [
    WorkflowService,
    WorkflowHttpGateway,
    WorkflowRpcGateway,
    ReadWorkflowLambda,
  ],
})
export class WorkflowModule {}
