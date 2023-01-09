import { Inject, Service } from '@hisorange/kernel';
import { Lambda } from '../decorators/lambda.decorator';
import { InputHandleDTO } from '../dtos/input-handle.dto';
import { OutputHandleDTO } from '../dtos/output-handle.dto';
import { FlowSession } from '../library/flow.session';
import { CrudService } from '../services/crud.service';
import { ILambda } from '../types/lambda.interface';

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
    @Inject(CrudService)
    readonly crud: CrudService,
  ) {}

  async invoke(session: FlowSession) {
    const input = session.getInput('record') as any;
    const config = session.getConfig() as Config;

    try {
      const result = await this.crud.create(
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
          message: (error as Error)?.message,
          code: 500,
        },
      };
    }
  }
}
