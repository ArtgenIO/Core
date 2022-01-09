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
};

type Input = {
  identifiers: Record<string, string>;
  changes: Record<string, unknown>;
};

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'rest.update',
  description: 'Update record',
  handles: [
    new InputHandleDTO('update', {
      type: 'object',
      properties: {
        identifiers: {
          type: 'object',
        },
        changes: {
          type: 'object',
        },
      },
    }),
    new OutputHandleDTO('record', {
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
export class RestUpdateLambda implements ILambda {
  constructor(
    @Inject(RestService)
    readonly service: RestService,
  ) {}

  async invoke(session: WorkflowSession) {
    const update = session.getInput<Input>('update');
    const config = session.getConfig<Config>();

    try {
      return {
        record: this.service.update(
          config.database,
          config.schema,
          update.identifiers,
          update.changes,
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
