import { Service } from '@hisorange/kernel';
import dayjs from 'dayjs';
import { Lambda } from '../decorators/lambda.decorator';
import { OutputHandleDTO } from '../dtos/output-handle.dto';
import { FlowSession } from '../library/flow.session';
import { JSCHEMA_TRIGGER } from '../library/json-schema.helpers';
import { ILambda } from '../types/lambda.interface';
import { ITriggerConfig } from '../types/trigger-config.interface';

export type CronTriggerConfig = {
  pattern: string;
} & ITriggerConfig;

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'trigger.cron',
  icon: 'trigger.cron.png',
  description: 'Start the process by a CRON timer',
  handles: [
    new OutputHandleDTO('time', {
      type: 'object',
      properties: {
        year: { type: 'number' },
        month: { type: 'number' },
        day: { type: 'number' },
        hour: { type: 'number' },
        minute: { type: 'number' },
        second: { type: 'number' },
        pattern: { type: 'string' },
      },
    }),
  ],
  config: {
    type: 'object',
    properties: {
      pattern: {
        type: 'string',
        title: 'CRON Pattern',
        default: '* * * * * *',
        description: 'CRON trigger pattern',
      },
      ...JSCHEMA_TRIGGER,
    },
    required: ['pattern'],
  },
})
export class CronTriggerLambda implements ILambda {
  async invoke(session: FlowSession) {
    const now = dayjs();
    const config = session.getConfig<CronTriggerConfig>();

    return {
      time: {
        year: now.year(),
        month: now.month(),
        day: now.date(),
        hour: now.hour(),
        minute: now.minute(),
        second: now.second(),
        pattern: config.pattern,
      },
    };
  }
}
