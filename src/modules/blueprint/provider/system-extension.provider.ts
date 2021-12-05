import { Provider } from '@loopback/context';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Service } from '../../../app/container';
import { SEED_DIR } from '../../../app/globals';
import { IExtension } from '../interface/extension.interface';

@Service()
export class SystemExtensionProvider implements Provider<IExtension> {
  value() {
    return JSON.parse(
      readFileSync(join(SEED_DIR, 'system.extension.json')).toString(),
    ) as IExtension;
  }
}
