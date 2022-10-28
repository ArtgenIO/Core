import { Provider, Service } from '@hisorange/kernel';
import { readFileSync } from 'fs';
import { join } from 'path';
import { SEED_DIR } from '../../../app/globals';
import { migrateSchema } from '../../database/utils/migrate-schema';
import { IBlueprint } from '../interface/blueprint.interface';

@Service()
export class ArtgenBlueprintProvider implements Provider<IBlueprint> {
  value() {
    const blueprint = JSON.parse(
      readFileSync(join(SEED_DIR, 'artgen.blueprint.json')).toString(),
    ) as IBlueprint;

    blueprint.schemas.forEach(migrateSchema);

    return blueprint;
  }
}
