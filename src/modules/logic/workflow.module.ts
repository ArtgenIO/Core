import { IModule, Inject, Module } from '../../app/container';
import { DatabaseModule } from '../database/database.module';
import { IdentityModule } from '../identity/identity.module';
import { LogicHttpGateway } from './gateway/http.gateway';
import { WorkflowRpcGateway } from './gateway/rpc.gateway';
import { WorkflowService as LogicService } from './service/workflow.service';

@Module({
  dependsOn: [IdentityModule, DatabaseModule],
  providers: [LogicService, LogicHttpGateway, WorkflowRpcGateway],
})
export class LogicModule implements IModule {
  constructor(
    @Inject(LogicService)
    readonly service: LogicService,
  ) {}

  async onStart() {
    await this.service.seed();
  }
}
