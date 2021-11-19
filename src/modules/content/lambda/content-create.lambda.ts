import { genSaltSync, hashSync } from 'bcrypt';
import { Inject, Service } from '../../../app/container';
import { getErrorMessage } from '../../../app/kernel';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';
import { WorkflowSession } from '../../workflow/library/workflow.session';
import { ContentService } from '../service/content.service';

type Config = {
  database: string;
  schema: string;
};

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'content.create',
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
export class ContentCreateLambda implements ILambda {
  constructor(
    @Inject(ContentService)
    readonly service: ContentService,
  ) {}

  async invoke(session: WorkflowSession) {
    const input = session.getInput('record') as any;
    const config = session.getConfig() as Config;

    try {
      // TODO: remove this!
      if ((input as any)?.password) {
        (input as any).password = hashSync(
          (input as any).password,
          genSaltSync(4),
        );
      }

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
