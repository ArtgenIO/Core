import { Constructor, MetadataInspector } from '@loopback/context';
import { debounce } from 'debounce';
import { EventEmitter2 } from 'eventemitter2';
import { v4 } from 'uuid';
import { OnParams, ON_META_KEY } from '.';
import { ILogger, Inject, Logger } from '../../app/container';
import { IKernel } from '../../app/kernel';
import { FlowService } from '../flow/service/workflow.service';
import { EventTriggerConfig } from './lambda/event.trigger';

export class EventService {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(EventEmitter2)
    readonly bus: EventEmitter2,
    @Inject(FlowService)
    readonly workflow: FlowService,
  ) {}

  async register(kernel: IKernel) {
    // Register event observers.
    const event = await kernel.context.get<EventEmitter2>(EventEmitter2.name);

    for (const key of kernel.context.findByTag<Constructor<unknown>>(
      'observer',
    )) {
      const observer = await key.getValue(kernel.context);
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

          event['on'](mdata.event, handler, mdata.options);
        }
      }
    }

    // Register workflows
    const workflows = await this.workflow.findAll();

    for (const workflow of workflows) {
      const trigger = workflow.nodes.find(
        node => node.type === 'trigger.event',
      );

      if (trigger) {
        const config = trigger.config as EventTriggerConfig;

        this.logger.info(
          'EventHook [%s][%s] listening for [%s] event',
          workflow.id,
          trigger.id,
          config.eventName,
        );

        this.bus.on(config.eventName, async (eventData: unknown) => {
          const startAt = Date.now();
          const eventId = v4();
          const session = await this.workflow.createWorkflowSession(
            workflow.id,
            eventId,
          );

          const response = await session.trigger(trigger.id, {
            name: config.eventName,
            data: eventData,
          });

          const elapsed = Date.now() - startAt;
          this.logger.info(
            'WFSession [%s] executed in [%d] ms',
            session.id,
            elapsed,
          );

          return response.data;
        });
      }
    }
  }

  async deregister(kernel: IKernel) {
    // Deregister event handlers.
    (
      await kernel.context.get<EventEmitter2>(EventEmitter2.name)
    ).removeAllListeners();
  }
}
