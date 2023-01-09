import { ILogger, Inject, Logger, Service } from '@hisorange/kernel';
import EventEmitter2 from 'eventemitter2';
import { v4 } from 'uuid';
import { EventTriggerConfig } from '../lambdas/event.trigger';
import { FlowService } from './flow.service';

@Service()
export class FlowEventService {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(EventEmitter2)
    readonly eventBus: EventEmitter2,
    @Inject(FlowService)
    readonly flowService: FlowService,
  ) {}

  async register() {
    // Register flow
    const flows = await this.flowService.findAll();

    for (const flow of flows.filter(f => f.isActive)) {
      const trigger = flow.nodes.find(node => node.type === 'trigger.event');

      if (trigger) {
        const config = trigger.config as EventTriggerConfig;

        this.logger.info(
          'EventHook [%s][%s] listening for [%s] event',
          flow.id,
          trigger.id,
          config.eventName,
        );

        this.eventBus.on(config.eventName, async (eventData: unknown) => {
          const startAt = Date.now();
          const eventId = v4();
          const session = await this.flowService.createSession(
            flow.id,
            eventId,
          );

          const response = await session.trigger(trigger.id, {
            name: config.eventName,
            data: eventData,
          });

          this.logger.info(
            'CRON flow triggered [%s] with [%s] as session identifier, by event [%s]',
            flow.id,
            session.id,
            config.eventName,
          );

          const elapsed = Date.now() - startAt;
          this.logger.info(
            'FlowSession [%s] executed in [%d] ms',
            session.id,
            elapsed,
          );

          return response.data;
        });
      }
    }
  }

  async deregister() {
    // Deregister event handlers.
    this.eventBus.removeAllListeners();
  }
}
