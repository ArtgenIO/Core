import { Inject, Service } from '../../../app/container';
import { getErrorMessage } from '../../../app/kernel';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';
import { WorkflowSession } from '../../workflow/library/workflow.session';
import { RestService } from '../rest.service';

type Config = {
  database: string;
  schema: string;
};

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'rest.list',
  description: 'List records',
  handles: [
    new InputHandleDTO('pagination'),
    new OutputHandleDTO('records', {
      type: 'array',
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
        default: 'system',
      },
      schema: {
        title: 'Schema',
        type: 'string',
      },
    },
    required: ['database', 'schema'],
  },
})
export class RestListLambda implements ILambda {
  constructor(
    @Inject(RestService)
    readonly service: RestService,
  ) {}

  async invoke(session: WorkflowSession) {
    const config = session.getConfig() as Config;

    try {
      return {
        records: await this.service.list(config.database, config.schema),
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
