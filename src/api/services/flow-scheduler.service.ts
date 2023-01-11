import { ILogger, Inject, Logger, Service } from '@hisorange/kernel';
import schedule from 'node-schedule';
import { CronTriggerConfig } from '../lambdas/cron.trigger';
import { FlowService } from './flow.service';

@Service()
export class FlowSchedulerService {
  protected jobs = new Map<string, schedule.Job>();

  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(FlowService)
    readonly flowService: FlowService,
  ) {}

  deregister() {
    this.jobs.forEach((job, name) => {
      this.logger.info('Canceling job [%s]', name);
      job.cancel();
    });
  }

  async register() {
    this.deregister();

    await Promise.all([this.registerFlows()]);
  }

  protected async registerFlows() {
    this.logger.debug('Registering flows');

    for (const flow of (await this.flowService.findAll()).filter(
      f => f.isActive,
    )) {
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

        this.jobs.set(name, job);

        this.logger.info(
          'Flow job [%s] scheduled [%s] next execution [%s]',
          name,
          timing,
          job.nextInvocation().toISOString(),
        );
      }
    }
  }
}
