import { ILogger, Logger, Service } from '../../../system/container';

@Service()
export class CrudService {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}

  // https://typeorm.io/#/custom-repository
  async insert(
    database: string,
    collection: string,
    record: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    // Do the job...

    return record;
  }
}
