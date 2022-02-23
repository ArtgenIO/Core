import { IModule, Module } from '../../app/container';
import { moduleRef } from '../../app/container/module-ref';
import { DatabaseModule } from '../database/database.module';
import { IdentityModule } from '../identity/identity.module';
import { LambdaModule } from '../lambda/lambda.module';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { FlowObserver } from './flow.observer';
import { LogicHttpGateway } from './gateway/http.gateway';
import { FlowRpcGateway } from './gateway/rpc.gateway';
import { FlowService } from './service/flow.service';

@Module({
  imports: [moduleRef(() => LambdaModule), TelemetryModule],
  dependsOn: [IdentityModule, moduleRef(() => DatabaseModule)],
  providers: [FlowService, LogicHttpGateway, FlowRpcGateway, FlowObserver],
})
export class FlowModule implements IModule {}
