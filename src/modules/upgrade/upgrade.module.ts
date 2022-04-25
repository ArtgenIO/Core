import { Module } from '../../app/container';
import { VersionProvider } from './provider/version.provider';

@Module({
  providers: [VersionProvider],
})
export class UpgradeModule {}
