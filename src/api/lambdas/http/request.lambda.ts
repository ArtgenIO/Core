import { Service } from '@hisorange/kernel';
import client, { AxiosError, AxiosRequestConfig } from 'axios';
import { Lambda } from '../../decorators/lambda.decorator';
import { LambdaInputHandleDTO } from '../../dtos/lambda/input-handle.dto';
import { LambdaOutputHandleDTO } from '../../dtos/lambda/output-handle.dto';
import { FlowSession } from '../../library/flow.session';
import { ILambda } from '../../types/lambda.interface';

type Config = {
  userAgent: string;
  url: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT' | 'OPTIONS' | 'HEAD';
  body: string | null;
  timeout: number;
  headers: { header: string; value: string }[];
};

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'http.request',
  description: 'Make an external HTTP request',
  icon: 'http.request.png',
  handles: [
    new LambdaInputHandleDTO('target', {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          examples: ['https://artgen.io'],
        },
      },
      required: ['url'],
    }),
    new LambdaOutputHandleDTO('result', {
      type: 'object',
      properties: {
        data: {},
        statusText: {
          type: 'string',
        },
        status: {
          type: 'number',
        },
        headers: {
          type: 'object',
        },
      },
    }),
    new LambdaOutputHandleDTO('error', {
      type: 'object',
    }),
  ],
  config: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        title: 'Target URL',
        default: null,
      },
      userAgent: {
        type: 'string',
        title: 'User Agent',
        default: 'Artgen HTTP Request Lambda 1.0',
      },
      method: {
        title: 'HTTP Verb',
        default: 'GET',
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      },
      body: {
        title: 'Request Body',
        default: null,
        type: 'string',
      },
      timeout: {
        title: 'Timeout In Milliseconds',
        default: 30_000,
        type: 'number',
      },
      headers: {
        title: 'Extra Headers',
        type: 'array',
        items: {
          type: 'object',
          properties: {
            header: {
              title: 'Header',
              type: 'string',
            },
            value: {
              title: 'Value',
              type: 'string',
            },
          },
        },
      },
    },
    required: ['userAgent', 'method', 'url'],
  },
})
export class HttpRequestLambda implements ILambda {
  async invoke(ctx: FlowSession) {
    const config = ctx.getConfig<Config>();

    try {
      const extraHeaders: { [header: string]: string } = {};

      if (config.headers) {
        for (const h of config.headers) {
          extraHeaders[h.header] = h.value;
        }
      }

      const request: AxiosRequestConfig = {
        url: config.url,
        method: config.method,
        data: config.body ?? undefined,
        headers: {
          'user-agent': config.userAgent.toString(),
          ...extraHeaders,
        },
        timeout: config.timeout,
      };

      const response = await client.request(request);

      return {
        result: {
          headers: response.headers,
          body: response.data,
        },
      };
    } catch (error) {
      return {
        error: {
          message: (error as AxiosError).message,
          code: (error as AxiosError).code ?? -1,
        },
      };
    }
  }
}
