import { ILogger, Inject, Logger, Service } from '@hisorange/kernel';
import { Reflector } from '@loopback/metadata';
import { LAMBDA_DECORATOR_META_KEY } from '../decorators/lambda.decorator';
import { ILambda } from '../types/lambda.interface';
import { ILambdaMeta } from '../types/meta.interface';
import { ILambdaRecord } from '../types/record.interface';

@Service()
export class LambdaService {
  readonly registry: Map<string, ILambdaRecord>;

  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(binding => binding.tagNames.includes('lambda'))
    lambdas: ILambda[],
  ) {
    this.registry = this.toRecords(lambdas);
  }

  protected toRecords(nodes: ILambda[]): Map<string, ILambdaRecord> {
    const map = new Map<string, ILambdaRecord>();

    for (const handler of nodes) {
      if (
        Reflector.hasOwnMetadata(LAMBDA_DECORATOR_META_KEY, handler.constructor)
      ) {
        const meta: ILambdaMeta = Reflector.getOwnMetadata(
          LAMBDA_DECORATOR_META_KEY,
          handler.constructor,
        );

        map.set(meta.type, {
          meta,
          handler: handler,
        });

        this.logger.info('Lambda [%s] registered', meta.type);
      } else {
        this.logger.warn(
          'Lambda [%s] has no metadata!',
          handler.constructor.name,
        );
      }
    }

    return map;
  }

  findByType(type: string) {
    return this.registry.get(type);
  }

  findAll(): ILambdaRecord[] {
    return Array.from(this.registry.values());
  }
}
