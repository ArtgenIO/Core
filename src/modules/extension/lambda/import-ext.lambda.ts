import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { getErrorMessage } from '../../../app/kernel/util/extract-error';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';
import { WorkflowSession } from '../../workflow/library/workflow.session';
import { ExtensionService } from '../extension.service';
import { IExtension } from '../interface/extension.interface';

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'extension.import',
  description: 'Import an extension',
  handles: [
    new InputHandleDTO('import', {
      type: 'object',
      properties: {
        database: {
          title: 'Database name',
          type: 'string',
        },
        extension: {
          type: 'object',
        },
      },
    }),
    new OutputHandleDTO('extension', {
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
})
export class ExtensionImportLambda implements ILambda {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(ExtensionService)
    readonly extService: ExtensionService,
  ) {}

  async invoke(session: WorkflowSession) {
    const imp = session.getInput('import') as {
      database: string;
      extension: IExtension;
    };

    try {
      return {
        extension: await this.extService.importFromSource(
          imp.database,
          imp.extension,
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
