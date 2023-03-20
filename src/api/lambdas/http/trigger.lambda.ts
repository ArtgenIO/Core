import { Service } from '@hisorange/kernel';
import { Lambda } from '../../decorators/lambda.decorator';
import { LambdaOutputHandleDTO } from '../../dtos/lambda/output-handle.dto';
import { FlowSession } from '../../library/flow.session';
import {
  JSCHEMA_MAP,
  JSCHEMA_TRIGGER,
} from '../../library/json-schema.helpers';
import { ILambda } from '../../types/lambda.interface';
import { RowLike } from '../../types/row-like.interface';
import { ITriggerConfig } from '../../types/trigger-config.interface';

type IncomingRequest = {
  headers: RowLike;
  params: RowLike;
  query: RowLike;
  body: RowLike | string;
  url: string;
};

export type HttpTriggerConfig = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  statusCode: number;
  authentication: string;
} & ITriggerConfig;

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'trigger.http',
  icon: 'trigger.http.png',
  description: 'Start the process with a webhook',
  handles: [
    new LambdaOutputHandleDTO('request', {
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
        default: '/api/flow/NODE_ID_HERE_WHEN_TP_IMPLEMENTED',
        description: 'Registered route',
      },
      method: {
        type: 'string',
        title: 'Request Method',
        enum: ['GET', 'POST', 'PATCH', 'DELETE'],
        default: 'GET',
      },
      statusCode: {
        title: 'Default Status Code',
        enum: ['200', '201', '400', '401', '404', '500'],
        default: '200',
      },
      authentication: {
        title: 'Authentication',
        enum: ['public', 'protected'],
        default: 'public',
      },
      ...JSCHEMA_TRIGGER,
    },
    required: ['method', 'path'],
  },
})
export class HttpTriggerLambda implements ILambda {
  async invoke(session: FlowSession) {
    return {
      request: session.getContext().$trigger as IncomingRequest,
    };
  }
}
