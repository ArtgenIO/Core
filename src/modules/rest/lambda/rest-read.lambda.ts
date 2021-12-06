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

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'rest.read',
  description: 'Read a single record',
  handles: [
    new InputHandleDTO('identifiers', {
      type: 'object',
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
export class RestReadLambda implements ILambda {
  constructor(
    @Inject(RestService)
    readonly service: RestService,
  ) {}

  async invoke(session: WorkflowSession) {
    const identifiers = session.getInput('identifiers') as any;
    const config = session.getConfig() as Config;

    try {
      return {
        record: await this.service.read(
          config.database,
          config.schema,
          identifiers,
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
