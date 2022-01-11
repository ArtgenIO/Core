import { Constructor, MetadataInspector } from '@loopback/context';
import schedule from 'node-schedule';
import { JobParams, JOB_META_KEY } from '.';
import { ILogger, Inject, Logger, Service } from '../../app/container';
import { IKernel } from '../../app/kernel';
import { FlowService } from '../flow/service/flow.service';
import { CronTriggerConfig } from './lambda/cron.trigger';

@Service()
export class SchedulerService {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(FlowService)
    readonly flowService: FlowService,
  ) {}

  async register(kernel: IKernel) {
    await Promise.all([
      this.registerDecorators(kernel),
      this.registerFlows(kernel),
    ]);
  }

  protected async registerFlows(kernel: IKernel) {
    this.logger.debug('Registering flows');

    for (const flow of await this.flowService.findAll()) {
      const triggers = flow.nodes.filter(t => t.type === 'trigger.cron');

      for (const trigger of triggers) {
        const name = flow.id + '::' + trigger.id;
        const timing = (trigger.config as CronTriggerConfig).pattern;

        const job = schedule.scheduleJob(name, timing, async () => {
          const session = await this.flowService.createSession(flow.id);

          this.logger.info(
            'CRON flow invoked [%s] with [%s] as session identifier',
            flow.id,
            session.id,
          );
          session.trigger(trigger.id, {});
        });

        this.logger.info(
          'Flow job [%s] scheduled [%s] next execution [%s]',
          name,
          timing,
          job.nextInvocation().toISOString(),
        );
      }
    }
  }

  protected async registerDecorators(kernel: IKernel) {
    this.logger.debug('Registering decorators');

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
}
