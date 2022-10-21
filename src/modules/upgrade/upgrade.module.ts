import { Module } from '@hisorange/kernel';
import { VersionProvider } from './provider/version.provider';

@Module({
  providers: [VersionProvider],
})
export class UpgradeModule {}
