import { IModule, Inject, Module } from '../../app/container';
import { DatabaseModule } from '../database/database.module';
import { IdentityModule } from '../identity/identity.module';
import { WorkflowHttpGateway } from './gateway/http.gateway';
import { WorkflowRpcGateway } from './gateway/rpc.gateway';
import { WorkflowService } from './service/workflow.service';

@Module({
  dependsOn: [IdentityModule, DatabaseModule],
  providers: [WorkflowService, WorkflowHttpGateway, WorkflowRpcGateway],
})
export class WorkflowModule implements IModule {
  constructor(
    @Inject(WorkflowService)
    readonly service: WorkflowService,
  ) {}

  async onStart() {
    await this.service.seed();
  }
}
