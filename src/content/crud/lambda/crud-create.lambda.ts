import { genSaltSync, hashSync } from 'bcrypt';
import { SchemaService } from '../../../content/schema/service/schema.service';
import { Lambda } from '../../../management/lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../../management/lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../../management/lambda/dto/output-handle.dto';
import { ILambda } from '../../../management/lambda/interface/lambda.interface';
import { WorkflowSession } from '../../../management/workflow/library/workflow.session';
import { Inject, Service } from '../../../system/container';
import { getErrorMessage } from '../../../system/kernel';

type Config = {
  database: string;
  schema: string;
};

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'crud.create',
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
export class CrudCreateLambda implements ILambda {
  constructor(
    @Inject(SchemaService)
    readonly schema: SchemaService,
  ) {}

  async invoke(session: WorkflowSession) {
    const input = session.getInput('record') as any;
    const config = session.getConfig() as Config;
    const model = this.schema.model(config.database, config.schema);

    try {
      // TODO: remove this!
      if ((input as any)?.password) {
        (input as any).password = hashSync(
          (input as any).password,
          genSaltSync(4),
        );
      }

      const result = await model.create(input);

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
