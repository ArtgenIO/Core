import { IModule, Module } from '../../app/container';
import { IKernel } from '../../app/kernel';
import { BlueprintObserver } from './blueprint.observer';
import { BlueprintService } from './blueprint.service';
import { ExtensionImportLambda } from './lambda/import-ext.lambda';
import { SystemBlueprintProvider } from './provider/system-extension.provider';

@Module({
  providers: [
    ExtensionImportLambda,
    BlueprintService,
    BlueprintObserver,
    SystemBlueprintProvider,
  ],
})
export class BlueprintModule implements IModule {
  async onStart(kernel: IKernel) {
    await (await kernel.get(BlueprintService)).seed();
  }
}
