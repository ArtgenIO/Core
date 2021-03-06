import schedule from 'node-schedule';
import { IModule, Module } from '../../app/container';
import { IKernel } from '../../app/kernel';
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
