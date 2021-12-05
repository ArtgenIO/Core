import axios, { AxiosError } from 'axios';
import { Service } from '../../../app/container';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';
import { WorkflowSession } from '../../logic/library/workflow.session';

type Input = {
  url: string;
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
        code: {
          type: 'number',
        },
      },
      required: ['message', 'code'],
    }),
  ],
})
export class HttpRequestLambda implements ILambda {
  async invoke(ctx: WorkflowSession) {
    const target = ctx.getInput('target') as Input;

    try {
      const response = await axios.get(target.url);

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
