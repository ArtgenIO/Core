import axios, { AxiosError } from 'axios';
import { Service } from '../../../app/container';
import { WorkflowSession } from '../../flow/library/workflow.session';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';

type Input = {
  url: string;
};

type Config = {
  userAgent: string;
};

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'http.request',
  description: 'Make an external HTTP request',
  icon: 'http.request.png',
  handles: [
    new InputHandleDTO('target', {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          examples: ['https://artgen.io'],
        },
      },
      required: ['url'],
    }),
    new OutputHandleDTO('result', {
      type: 'object',
    }),
    new OutputHandleDTO('error', {
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        code: {},
      },
      required: ['message', 'code'],
    }),
  ],
  config: {
    type: 'object',
    properties: {
      userAgent: {
        type: 'string',
        default: 'Artgen HTTP Request Lambda 1.0',
      },
    },
    required: ['userAgent'],
  },
})
export class HttpRequestLambda implements ILambda {
  async invoke(ctx: WorkflowSession) {
    const target = ctx.getInput('target') as Input;
    const config = ctx.getConfig<Config>();

    try {
      const response = await axios.get(target.url, {
        headers: {
          'user-agent': config.userAgent.toString(),
        },
      });

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
          code: (error as AxiosError).code,
        },
      };
    }
  }
}
