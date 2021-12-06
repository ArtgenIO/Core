import { IModule, Inject, Module } from '../../app/container';
import { DatabaseModule } from '../database/database.module';
import { IdentityModule } from '../identity/identity.module';
import { LogicHttpGateway } from './gateway/http.gateway';
import { WorkflowRpcGateway } from './gateway/rpc.gateway';
import { FlowService } from './service/workflow.service';

@Module({
  dependsOn: [IdentityModule, DatabaseModule],
  providers: [FlowService, LogicHttpGateway, WorkflowRpcGateway],
})
export class FlowModule implements IModule {
  constructor(
    @Inject(FlowService)
    readonly service: FlowService,
  ) {}

  async onStart() {
    await this.service.seed();
  }
}
