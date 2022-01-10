import axios from 'axios';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { ILogger, Logger, Service } from '../../app/container';
import { ROOT_DIR } from '../../app/globals';
const semver = require('semver-compare');

const CHANNEL = 'stable';

@Service()
export class UpgradeService {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}

  async shouldUpgrade(): Promise<boolean> {
    if (process.env.NODE_ENV !== 'production') {
      return false;
    }

    const localVersion = await this.getLocalVersion();

    return (
      semver(await this.getUpstreamVersion(localVersion), localVersion) === 1
    );
  }

  async getLocalVersion(): Promise<string> {
    return (await readFile(join(ROOT_DIR, 'version'))).toString();
  }

  async getUpstreamVersion(localVersion: string): Promise<string> {
    try {
      const reply = await axios.get(
        `https://artgen.cloud/version?channel=${CHANNEL}&uptime=${process.uptime()}&local-version=${localVersion}`,
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

    return this.getLocalVersion();
  }
}
