import { Service } from '../../../app/container';
import { RowLike } from '../../../app/interface/row-like.interface';
import { FlowSession } from '../../flow/library/flow.session';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';
import { ITriggerConfig } from '../../lambda/interface/trigger-config.interface';
import {
  JSCHEMA_MAP,
  JSCHEMA_TRIGGER,
} from '../../lambda/utility/json-schema.helpers';

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
