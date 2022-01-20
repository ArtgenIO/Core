import { Inject, Service } from '../../../app/container';
import { getErrorMessage } from '../../../app/kernel';
import { FlowSession } from '../../flow/library/flow.session';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';
import { RestService } from '../service/rest.service';

type Config = {
  database: string;
  schema: string;
};

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'rest.create',
  description: 'Create a new recrod',
  icon: 'db.insert.png',
  handles: [
    new InputHandleDTO('record', {
      type: 'object',
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
  config: {
    type: 'object',
    properties: {
      database: {
        title: 'Database',
        type: 'string',
        default: 'main',
      },
      schema: {
        title: 'Schema',
        type: 'string',
      },
    },
    required: ['database', 'schema'],
  },
})
export class RestCreateLambda implements ILambda {
  constructor(
    @Inject(RestService)
    readonly service: RestService,
  ) {}

  async invoke(session: FlowSession) {
    const input = session.getInput('record') as any;
    const config = session.getConfig() as Config;

    try {
      const result = await this.service.create(
        config.database,
        config.schema,
        input,
      );

      return {
        result,
      };
    } catch (error) {
      return {
        error: {
          message: getErrorMessage(error),
          code: 500,
        },
      };
    }
  }
}
