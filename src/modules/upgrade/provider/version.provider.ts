import { Provider } from '@loopback/context';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Service } from '../../../app/container';
import { ROOT_DIR } from '../../../app/globals';

@Service()
export class VersionProvider implements Provider<string> {
  value(): string {
    return readFileSync(join(ROOT_DIR, 'version')).toString();
  }
}
