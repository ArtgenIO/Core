import { IModule, Module } from '../../app/container';
import { IKernel } from '../../app/kernel';
import { BlueprintObserver } from './blueprint.observer';
import { BlueprintService } from './blueprint.service';
import { BlueprintImportLambda } from './lambda/import-ext.lambda';
import { SystemBlueprintProvider } from './provider/system-blueprint.provider';

@Module({
  providers: [
    BlueprintImportLambda,
    BlueprintService,
    BlueprintObserver,
    SystemBlueprintProvider,
  ],
})
export class BlueprintModule implements IModule {
  async onBoot(kernel: IKernel) {
    await (await kernel.get(BlueprintService)).seed();
  }
}
