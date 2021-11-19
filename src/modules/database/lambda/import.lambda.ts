import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { Exception } from '../../../app/exceptions/exception';
import { getErrorMessage } from '../../../app/kernel/util/extract-error';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';
import { SchemaService } from '../../schema/service/schema.service';
import { WorkflowSession } from '../../workflow/library/workflow.session';
import { LinkService } from '../service/link.service';

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'db.import',
  description: 'Import table schemas from an existing databse',
  icon: 'db.insert.png',
  handles: [
    new InputHandleDTO('name', {
      title: 'Database name',
      type: 'string',
    }),
    new OutputHandleDTO('schemas', {
      type: 'array',
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
})
export class DatabaseImportLambda implements ILambda {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(LinkService)
    readonly link: LinkService,
    @Inject(SchemaService)
    readonly schema: SchemaService,
  ) {}

  async invoke(session: WorkflowSession) {
    const name = session.getInput('name') as string;

    try {
      const link = this.link.findByName(name);
      if (!link) {
        throw new Exception(`Unknown database [${name}]`);
      }
      const schemas = await this.link.discover(link);

      for (const schema of schemas) {
        try {
          await this.schema.create(schema);
        } catch (error) {
          this.logger.warn('Oups! [%s]', getErrorMessage(error));
        }
      }

      return {
        schemas,
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
