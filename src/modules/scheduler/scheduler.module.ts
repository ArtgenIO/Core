import { Constructor, MetadataInspector } from '@loopback/context';
import schedule from 'node-schedule';
import { JobParams, JOB_META_KEY } from '.';
import { ILogger, Logger, Module } from '../../app/container';
import { IKernel } from '../../app/kernel';

@Module({})
export class SchedulerModule {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}

  async onStart(kernel: IKernel) {
    for (const key of kernel.context.findByTag<Constructor<unknown>>(
      'scheduler',
    )) {
      const scheduler = await key.getValue(kernel.context);
      const metadata = MetadataInspector.getAllMethodMetadata<JobParams>(
        JOB_META_KEY,
        scheduler,
      );

      for (const method in metadata) {
        if (Object.prototype.hasOwnProperty.call(metadata, method)) {
          let name = scheduler.constructor.name + '::' + method;
          const timing = metadata[method].timing;

          if (metadata[method]?.name) {
            name = metadata[method].name;
          }

          const job = schedule.scheduleJob(
            name,
            timing,
            scheduler[method].bind(scheduler),
          );

          this.logger.info(
            'Job [%s] scheduled [%s] next execution [%s]',
            name,
            timing,
            job.nextInvocation().toISOString(),
          );
        }
      }
    }
  }

  async onStop(kernel: IKernel) {
    await (schedule as any).gracefulShutdown();
  }
}
