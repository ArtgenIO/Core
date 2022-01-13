import axios from 'axios';
import { ILogger, Inject, Logger, Service } from '../../app/container';
import { VersionProvider } from './provider/version.provider';
const semver = require('semver-compare');

const CHANNEL = 'stable';

@Service()
export class UpgradeService {
  protected version: string;

  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(VersionProvider)
    readonly localVersion: string,
  ) {}

  async shouldUpgrade(): Promise<boolean> {
    if (process.env.NODE_ENV !== 'production') {
      return false;
    }

    return semver(await this.getUpstreamVersion(), this.localVersion) === 1;
  }

  async getUpstreamVersion(): Promise<string> {
    try {
      const reply = await axios.get(
        `https://artgen.cloud/version?channel=${CHANNEL}&uptime=${process.uptime()}&local-version=${
          this.localVersion
        }`,
        {
          timeout: 10000,
        },
      );

      if (typeof reply.data === 'object') {
        if (reply.data?.newest) {
          this.logger.warn(
            `Upstream version [${reply.data.newest}] on channel [${CHANNEL}]`,
          );

          return reply.data?.newest;
        } else {
          this.logger.warn('Received invalid version info');
        }
      } else {
        this.logger.warn('Could not fetch the version info');
      }
    } catch (error) {
      this.logger.error('Error while fetching the version info');
    }

    return this.localVersion;
  }
}
