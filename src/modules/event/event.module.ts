import { Constructor, MetadataInspector } from '@loopback/context';
import { EventEmitter2 } from 'eventemitter2';
import { v4 } from 'uuid';
import { OnParams, ON_META_KEY } from '.';
import { ILogger, Inject, Logger, Module } from '../../app/container';
import { IKernel } from '../../app/kernel';
import { WorkflowService } from '../workflow/service/workflow.service';
import { EventTrigger, EventTriggerConfig } from './lambda/event.trigger';
import { EventHandlerProvider } from './provider/event-handler.provider';

@Module({
  providers: [EventHandlerProvider, EventTrigger],
})
export class EventModule {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(EventEmitter2)
    readonly bus: EventEmitter2,
    @Inject(WorkflowService)
    readonly workflow: WorkflowService,
  ) {}

  async onStart(kernel: IKernel) {
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
          event['on'](
            metadatas[method].event,
            observer[method].bind(observer),
            metadatas[method].options,
          );
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

  async onStop(kernel: IKernel) {
    // Deregister event handlers.
    (
      await kernel.context.get<EventEmitter2>(EventEmitter2.name)
    ).removeAllListeners();
  }
}
