import { Provider } from '@loopback/context';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Service } from '../../../app/container';
import { SEED_DIR } from '../../../app/globals';
import { IBlueprint } from '../interface/blueprint.interface';

@Service()
export class SystemBlueprintProvider implements Provider<IBlueprint> {
  value() {
    return JSON.parse(
      readFileSync(join(SEED_DIR, 'system.blueprint.json')).toString(),
    ) as IBlueprint;
  }
}
