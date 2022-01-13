import { Provider } from '@loopback/context';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { Service } from '../../../app/container';
import { ROOT_DIR } from '../../../app/globals';

@Service()
export class VersionProvider implements Provider<string> {
  async value(): Promise<string> {
    return (await readFile(join(ROOT_DIR, 'version'))).toString();
  }
}
