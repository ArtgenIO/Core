import { IModule, Inject, Module } from '../../app/container';
import { RestModule } from '../rest/rest.module';
import { BlueprintObserver } from './blueprint.observer';
import { BlueprintService } from './blueprint.service';
import { ExtensionImportLambda } from './lambda/import-ext.lambda';
import { SystemBlueprintProvider } from './provider/system-extension.provider';

@Module({
  imports: [RestModule],
  providers: [
    ExtensionImportLambda,
    BlueprintService,
    BlueprintObserver,
    SystemBlueprintProvider,
  ],
})
export class BlueprintModule implements IModule {
  constructor(
    @Inject(BlueprintService)
    readonly service: BlueprintService,
  ) {}

  async onStart() {
    await this.service.seed();
  }
}
