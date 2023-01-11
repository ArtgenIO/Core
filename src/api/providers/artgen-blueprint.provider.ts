import { Provider, Service } from '@hisorange/kernel';
import { IBlueprint } from '../../models/blueprint.interface';
import { SystemBlueprint } from '../blueprints/system.blueprint';
import { migrateSchema } from '../library/migrate-schema';

@Service()
export class ArtgenBlueprintProvider implements Provider<IBlueprint> {
  value() {
    const blueprint = SystemBlueprint;
    blueprint.schemas.forEach(migrateSchema);
    return blueprint;
  }
}
