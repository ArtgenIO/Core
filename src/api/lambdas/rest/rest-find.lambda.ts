import { Inject, Service } from '@hisorange/kernel';
import { Lambda } from '../../decorators/lambda.decorator';
import { LambdaInputHandleDTO } from '../../dtos/lambda/input-handle.dto';
import { LambdaOutputHandleDTO } from '../../dtos/lambda/output-handle.dto';
import { FlowSession } from '../../library/flow.session';
import { SchemaService } from '../../services/schema.service';
import { ILambda } from '../../types/lambda.interface';
import { RowLike } from '../../types/row-like.interface';

type Config = {
  database: string;
  schema: string;
  fields?: string[];
  conditions?: { field: string; operator: string; value: any }[];
  offset: number;
  limit?: number;
  failOnEmpty: boolean;
};

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'rest.find',
  icon: 'rest.find.png',
  description: 'Find records',
  handles: [
    new LambdaInputHandleDTO('conditions', {}),
    new LambdaOutputHandleDTO('records', {
      type: 'array',
      items: {
        type: 'object',
      },
    }),
    new LambdaOutputHandleDTO('error', {
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
      conditions: {
        title: 'Conditions',
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: {
              title: 'Field Name',
              type: 'string',
            },
            operator: {
              title: 'Operator',
              enum: ['=', '!=', '>', '<'],
            },
            value: {
              title: 'Value',
              oneOf: [
                {
                  title: 'Boolean',
                  type: 'boolean',
                  default: true,
                },
                {
                  title: 'Text',
                  type: 'string',
                  default: '',
                },
                {
                  title: 'Number',
                  type: 'number',
                  default: 0,
                },
                {
                  title: 'Null',
                  type: 'null',
                  default: null,
                },
              ],
            },
          },
        },
      },
      offset: {
        title: 'Offset',
        type: 'number',
        default: 0,
      },
      limit: {
        title: 'Limit',
        type: 'number',
        default: null,
      },

      failOnEmpty: {
        type: 'boolean',
        title: 'Fail on Empty',
        default: true,
      },
    },
    required: ['database', 'schema', 'offset'],
  },
})
export class RestFindLambda implements ILambda {
  constructor(
    @Inject(SchemaService)
    readonly service: SchemaService,
  ) {}

  async onInit(): Promise<void> {}

  async invoke(session: FlowSession) {
    const inputConditions = session.getInput<RowLike>('conditions');
    const config = session.getConfig<Config>();

    try {
      // Load the model
      const model = this.service.getModel(config.database, config.schema);
      const schema = this.service.getSchema(config.database, config.schema);
      const q = model.query();

      if (config.fields && config.fields.length) {
        q.select(config.fields);
      }

      // Config based conditions
      if (config.conditions && !inputConditions) {
        for (const condition of config.conditions) {
          q.where(
            schema.fields.find(f => f.reference == condition.field).columnName,
            condition.operator,
            condition.value,
          );
        }
      } else {
        if (inputConditions) {
          q.where(inputConditions);
        }
      }

      if (config.offset) {
        q.offset(config.offset);
      }

      if (config.limit && config.limit.toString() != '-1') {
        q.limit(config.limit);
      }

      const records = (await q).map(r => r.$toJson());

      if (config.failOnEmpty && !records.length) {
        return {
          error: {
            message: 'No Rows',
            code: 1404,
          },
        };
      }

      return { records };
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
