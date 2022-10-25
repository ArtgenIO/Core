import { IModule, Inject, Module, moduleRef } from '@hisorange/kernel';
import { DatabaseModule } from '../database/database.module';
import { IdentityModule } from '../identity/identity.module';
import { LambdaModule } from '../lambda/lambda.module';
import { RestModule } from '../rest/rest.module';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { FlowObserver } from './flow.observer';
import { LogicHttpGateway } from './gateway/http.gateway';
import { CronTriggerLambda } from './lambda/cron.trigger.js';
import { EmitEventLambda } from './lambda/emit.lambda.js';
import { EventTrigger } from './lambda/event.trigger.js';
import { FlowEventService } from './service/flow-event.service.js';
import { FlowSchedulerService } from './service/flow-scheduler.service.js';
import { FlowService } from './service/flow.service';

@Module({
  imports: [
    moduleRef(() => LambdaModule),
    moduleRef(() => RestModule),
    TelemetryModule,
  ],
  dependsOn: [IdentityModule, moduleRef(() => DatabaseModule)],
  providers: [
    CronTriggerLambda,
    EmitEventLambda,
    EventTrigger,
    FlowEventService,
    FlowObserver,
    FlowSchedulerService,
    FlowService,
    LogicHttpGateway,
  ],
})
export class FlowModule implements IModule {
  constructor(
    @Inject(FlowSchedulerService)
    readonly flowSchedulerService: FlowSchedulerService,
    @Inject(FlowEventService)
    readonly flowEventService: FlowEventService,
  ) {}

  async onStart(): Promise<void> {
    this.flowSchedulerService.register();
    this.flowEventService.register();
  }

  async onStop(): Promise<void> {
    this.flowSchedulerService.deregister();
    this.flowEventService.deregister();
  }
}
