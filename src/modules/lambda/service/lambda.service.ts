import { Reflector } from '@loopback/metadata';
import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { LAMBDA_DECORATOR_META_KEY } from '../decorator/lambda.decorator';
import { ILambda } from '../interface/lambda.interface';
import { ILambdaMeta } from '../interface/meta.interface';
import { ILambdaRecord } from '../interface/record.interface';

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
