import { ILogger, Logger } from '../../../container';

export class AuthenticationService {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}
}
