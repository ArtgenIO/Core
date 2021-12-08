import { Inject, Service } from '../../../app/container';
import { getErrorMessage } from '../../../app/kernel';
import { WorkflowSession } from '../../flow/library/workflow.session';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';
import { RestService } from '../rest.service';

type Config = {
  database: string;
  schema: string;
  fields: string[];
};

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'rest.find',
  icon: 'rest.find.png',
  description: 'Find records',
  handles: [
    new InputHandleDTO('conditions', {
      type: 'object',
    }),
    new OutputHandleDTO('records', {
      type: 'array',
      items: {
        type: 'object',
      },
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
      fields: {
        title: 'Fields',
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
    required: ['database', 'schema'],
  },
})
export class RestFindLambda implements ILambda {
  constructor(
    @Inject(RestService)
    readonly service: RestService,
  ) {}

  async invoke(session: WorkflowSession) {
    const conditions = session.getInput<Record<string, unknown>>('conditions');
    const config = session.getConfig<Config>();

    try {
      return {
        records: await this.service.find(
          config.database,
          config.schema,
          conditions,
          config?.fields,
        ),
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
