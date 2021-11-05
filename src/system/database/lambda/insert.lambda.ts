import { genSaltSync, hashSync } from 'bcrypt';
import { ConnectionManager } from 'typeorm';
import { SchemaService } from '../../../content/schema/service/schema.service';
import { Lambda } from '../../../management/lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../../management/lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../../management/lambda/dto/output-handle.dto';
import { ILambda } from '../../../management/lambda/interface/lambda.interface';
import { WorkflowSession } from '../../../management/workflow/library/workflow.session';
import { getErrorMessage } from '../../app/util/extract-error';
import { Inject, Service } from '../../container';

type Config = {
  database: string;
  schema: string;
};

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'db.insert',
  description: 'Insert a new record',
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
export class DatabaseInsertLambda implements ILambda {
  constructor(
    @Inject(ConnectionManager)
    readonly connectionManager: ConnectionManager,
    @Inject(SchemaService)
    readonly schema: SchemaService,
  ) {}

  async invoke(session: WorkflowSession) {
    const input = session.getInput('record');
    const config = session.getConfig() as Config;
    const repository = this.schema.getRepository(
      config.database,
      config.schema,
    );

    try {
      // TODO: remove this!
      if ((input as any)?.password) {
        (input as any).password = hashSync(
          (input as any).password,
          genSaltSync(4),
        );
      }

      const result = repository.create(input);
      await repository.save(result);

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
