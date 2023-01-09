import { Provider, Service } from '@hisorange/kernel';
import { readFileSync } from 'fs';
import { join } from 'path';
import { SEED_DIR } from '../globals';
import { migrateSchema } from '../library/migrate-schema';
import { IBlueprint } from '../models/blueprint.interface';

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
