import { Provider, Service } from '@hisorange/kernel';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ROOT_DIR } from '../../paths';

@Service()
export class VersionProvider implements Provider<string> {
  value(): string {
    return readFileSync(join(ROOT_DIR, 'version')).toString();
  }
}
