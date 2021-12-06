import { IModule, Module } from '../../app/container';
import { moduleRef } from '../../app/container/module-ref';
import { IKernel } from '../../app/kernel';
import { DatabaseModule } from '../database/database.module';
import { IdentityModule } from '../identity/identity.module';
import { LambdaModule } from '../lambda/lambda.module';
import { LogicHttpGateway } from './gateway/http.gateway';
import { WorkflowRpcGateway } from './gateway/rpc.gateway';
import { FlowService } from './service/workflow.service';

@Module({
  imports: [moduleRef(() => LambdaModule)],
  dependsOn: [IdentityModule, moduleRef(() => DatabaseModule)],
  providers: [FlowService, LogicHttpGateway, WorkflowRpcGateway],
})
export class FlowModule implements IModule {
  async onReady(kernel: IKernel) {
    await (await kernel.get(FlowService)).seed();
  }
}
