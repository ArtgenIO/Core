import { Module } from '../../app/container';
import { VersionProvider } from './provider/version.provider';
import { UpgradeScheduler } from './upgrade.scheduler';
import { UpgradeService } from './upgrade.service';

@Module({
  providers: [UpgradeScheduler, UpgradeService, VersionProvider],
})
export class UpgradeModule {}
