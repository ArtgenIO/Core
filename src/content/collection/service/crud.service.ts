import { ILogger, Logger, Service } from '../../../system/container';

@Service()
export class CrudService {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}
}
