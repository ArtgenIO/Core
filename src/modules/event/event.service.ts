import { Constructor, MetadataInspector } from '@loopback/context';
import { debounce } from 'debounce';
import { EventEmitter2 } from 'eventemitter2';
import { v4 } from 'uuid';
import { OnParams, ON_META_KEY } from '.';
import { ILogger, Inject, Logger } from '../../app/container';
import { IKernel } from '../../app/kernel';
import { FlowService } from '../flow/service/flow.service';
import { EventTriggerConfig } from './lambda/event.trigger';

export class EventService {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(EventEmitter2)
    readonly bus: EventEmitter2,
    @Inject('Kernel')
    readonly kernel: IKernel,
  ) {}

  async register() {
    // Clear already hooked listeners
    this.bus.removeAllListeners();

    for (const key of this.kernel.context.findByTag<Constructor<unknown>>(
      'observer',
    )) {
      const observer = await key.getValue(this.kernel.context);
      const metadatas = MetadataInspector.getAllMethodMetadata<OnParams>(
        ON_META_KEY,
        observer,
      );

      for (const method in metadatas) {
        if (Object.prototype.hasOwnProperty.call(metadatas, method)) {
          let handler = observer[method].bind(observer);
          const mdata = metadatas[method];

          // Debounce support
          if (mdata.options?.debounce) {
            handler = debounce(handler, mdata.options.debounce);
          }

          this.bus['on'](mdata.event, handler, mdata.options);

          this.logger.debug('Event handler [%s] registered', mdata.event);
        }
      }
    }

    // Register flow
    const flowService = await this.kernel.get(FlowService);
    const flows = await flowService.findAll();

    for (const flow of flows) {
      const trigger = flow.nodes.find(node => node.type === 'trigger.event');

      if (trigger) {
        const config = trigger.config as EventTriggerConfig;

        this.logger.info(
          'EventHook [%s][%s] listening for [%s] event',
          flow.id,
          trigger.id,
          config.eventName,
        );

        this.bus.on(config.eventName, async (eventData: unknown) => {
          const startAt = Date.now();
          const eventId = v4();
          const session = await flowService.createSession(flow.id, eventId);

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
    this.bus.removeAllListeners();
  }
}
