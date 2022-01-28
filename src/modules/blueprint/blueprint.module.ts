import { IModule, Module } from '../../app/container';
import { IKernel } from '../../app/kernel';
import { BlueprintObserver } from './blueprint.observer';
import { BlueprintService } from './blueprint.service';
import { ArtgenBlueprintProvider } from './provider/artgen-blueprint.provider';

@Module({
  providers: [BlueprintService, BlueprintObserver, ArtgenBlueprintProvider],
})
export class BlueprintModule implements IModule {
  async onBoot(kernel: IKernel) {
    await (await kernel.get(BlueprintService)).seed();
  }
}
