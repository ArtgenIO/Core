import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { getErrorMessage } from '../../../app/kernel/util/extract-error';
import { FlowSession } from '../../flow/library/flow.session';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';
import { BlueprintService } from '../blueprint.service';
import { IBlueprint } from '../interface/blueprint.interface';

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'blueprint.import',
  description: 'Import a blueprint',
  handles: [
    new InputHandleDTO('import', {
      type: 'object',
      properties: {
        database: {
          title: 'Database name',
          type: 'string',
        },
        blueprint: {
          type: 'object',
        },
      },
    }),
    new OutputHandleDTO('blueprint', {
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
export class BlueprintImportLambda implements ILambda {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(BlueprintService)
    readonly extService: BlueprintService,
  ) {}

  async invoke(session: FlowSession) {
    const imp = session.getInput('import') as {
      database: string;
      blueprint: IBlueprint;
    };

    try {
      return {
        blueprint: await this.extService.importFromSource(
          imp.database,
          imp.blueprint,
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
