import { Service } from '@hisorange/kernel';
import dayjs from 'dayjs';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';
import { ITriggerConfig } from '../../lambda/interface/trigger-config.interface';
import { JSCHEMA_TRIGGER } from '../../lambda/utility/json-schema.helpers';
import { FlowSession } from '../library/flow.session';

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
