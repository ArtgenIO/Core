import { Module } from '../../app/container';
import { UpgradeScheduler } from './upgrade.scheduler';
import { UpgradeService } from './upgrade.service';

@Module({
  providers: [UpgradeScheduler, UpgradeService],
})
export class UpgradeModule {}
