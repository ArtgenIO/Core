import { Inject, Service } from '../../../app/container';
import { getErrorMessage } from '../../../app/kernel';
import { WorkflowSession } from '../../flow/library/workflow.session';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';
import { SchemaService } from '../../schema/service/schema.service';

type Config = {
  database: string;
  schema: string;
  fields?: string[];
  conditions?: { field: string; operator: string; value: any }[];
  offset: number;
  limit?: number;
};

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'rest.find',
  icon: 'rest.find.png',
  description: 'Find records',
  handles: [
    new InputHandleDTO('conditions', {}),
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
    },
    required: ['database', 'schema', 'offset'],
  },
})
export class RestFindLambda implements ILambda {
  constructor(
    @Inject(SchemaService)
    readonly service: SchemaService,
  ) {}

  async invoke(session: WorkflowSession) {
    const conditions = session.getInput<Record<string, unknown>>('conditions');
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
      if (config.conditions) {
        for (const condition of config.conditions) {
          q.where(
            schema.fields.find(f => f.reference == condition.field).columnName,
            condition.operator,
            condition.value,
          );
        }
      }

      // Input based conditions
      if (conditions) {
        //q.where(conditions);
      }

      if (config.offset) {
        q.offset(config.offset);
      }

      if (config.limit && config.limit.toString() != '-1') {
        q.limit(config.limit);
      }

      return {
        records: (await q).map(r => r.$toJson()),
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
