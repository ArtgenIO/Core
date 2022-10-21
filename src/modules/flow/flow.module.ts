import { IModule, Module, moduleRef } from '@hisorange/kernel';
import { DatabaseModule } from '../database/database.module';
import { EventModule } from '../event';
import { IdentityModule } from '../identity/identity.module';
import { LambdaModule } from '../lambda/lambda.module';
import { RestModule } from '../rest/rest.module';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { FlowObserver } from './flow.observer';
import { LogicHttpGateway } from './gateway/http.gateway';
import { FlowService } from './service/flow.service';

@Module({
  imports: [
    moduleRef(() => LambdaModule),
    moduleRef(() => EventModule),
    moduleRef(() => RestModule),
    TelemetryModule,
  ],
  dependsOn: [IdentityModule, moduleRef(() => DatabaseModule)],
  providers: [FlowService, LogicHttpGateway, FlowObserver],
})
export class FlowModule implements IModule {}
