import { ILogger, Inject, Logger } from '../../app/container';
import { Job, Scheduler } from '../scheduler';
import { UpgradeService } from './upgrade.service';

@Scheduler()
export class UpgradeScheduler {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(UpgradeService)
    readonly service: UpgradeService,
  ) {
    // Trigger at start
    this.checkUpgrade();
  }

  @Job({
    timing: '0 */12 * * *',
  })
  async checkUpgrade() {
    const shouldUpgade = await this.service.shouldUpgrade();

    this.logger.debug('Should upgrade [%s]', shouldUpgade ? 'Yes' : 'No');
  }
}
