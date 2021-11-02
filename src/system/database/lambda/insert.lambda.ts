import { genSaltSync, hashSync } from 'bcrypt';
import { ConnectionManager, Repository } from 'typeorm';
import { Lambda } from '../../../management/lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../../management/lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../../management/lambda/dto/output-handle.dto';
import { ILambda } from '../../../management/lambda/interface/lambda.interface';
import { WorkflowSession } from '../../../management/workflow/library/workflow.session';
import { getErrorMessage } from '../../app/util/extract-error';
import { IContext, Inject, Service } from '../../container';

type Config = {
  database: string;
  collection: string;
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
      collection: {
        title: 'Collection',
        type: 'string',
      },
    },
    required: ['database', 'collection'],
  },
})
export class DatabaseInsertLambda implements ILambda {
  constructor(
    @Inject('providers.ConnectionManagerProvider')
    readonly connectionManager: ConnectionManager,
    @Inject.context()
    readonly ctx: IContext,
  ) {}

  async invoke(session: WorkflowSession) {
    const input = session.getInput('record');
    const config = session.getConfig() as Config;
    const entity = this.ctx.getSync(
      `collection.${config.database}.${config.collection}`,
    );

    const connection = this.connectionManager.get(config.database);
    let repository: Repository<any>;

    if (connection.options.type === 'mongodb') {
      repository = connection.getMongoRepository(entity as any);
    } else {
      repository = connection.getRepository(entity as any);
    }

    try {
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
