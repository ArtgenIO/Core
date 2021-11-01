import { Service } from '../../../system/container';
import { WorkflowSession } from '../../workflow/library/workflow.session';
import { Lambda } from '../decorator/lambda.decorator';
import { OutputHandleDTO } from '../dto/output-handle.dto';
import { ILambda } from '../interface/lambda.interface';
import { ITriggerConfig } from '../interface/trigger-config.interface';
import { JSCHEMA_MAP, JSCHEMA_TRIGGER } from '../utility/json-schema.helpers';

type IncomingRequest = {
  headers: Record<string, unknown>;
  params: Record<string, unknown>;
  query: Record<string, unknown>;
  body: Record<string, unknown> | string;
  url: string;
};

export type HttpTriggerConfig = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
} & ITriggerConfig;

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'trigger.http',
  icon: 'trigger.http.png',
  description: 'Start the process with a webhook',
  handles: [
    new OutputHandleDTO('request', {
      type: 'object',
      properties: {
        headers: JSCHEMA_MAP,
        params: JSCHEMA_MAP,
        query: JSCHEMA_MAP,
        body: {},
        url: {
          type: 'string',
        },
      },
    }),
  ],
  config: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        title: 'Path',
        default: '/api/workflow/NODE_ID_HERE_WHEN_TP_IMPLEMENTED',
        description: 'Registered route',
      },
      method: {
        type: 'string',
        title: 'Request Method',
        enum: ['GET', 'POST', 'PATCH', 'DELETE'],
        default: 'GET',
      },
      ...JSCHEMA_TRIGGER,
    },
    required: ['method', 'path'],
  },
})
export class HttpTrigger implements ILambda {
  async invoke(session: WorkflowSession) {
    return {
      request: session.getContext().$trigger as IncomingRequest,
    };
  }
}
