import { IKernel, IModule, Module } from '@hisorange/kernel';
import schedule from 'node-schedule';
import { CronTriggerLambda } from './lambda/cron.trigger';
import { SchedulerObserver } from './scheduler.observer';
import { SchedulerService } from './scheduler.service';

@Module({
  providers: [SchedulerService, CronTriggerLambda, SchedulerObserver],
})
export class SchedulerModule implements IModule {
  async onStart(kernel: IKernel) {
    await (await kernel.get(SchedulerService)).register();
  }

  async onStop() {
    await (schedule as any).gracefulShutdown();
  }
}
