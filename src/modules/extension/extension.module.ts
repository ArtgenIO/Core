import { IModule, Inject, Module } from '../../app/container';
import { ExtensionObserver } from './extension.observer';
import { ExtensionService } from './extension.service';
import { ExtensionImportLambda } from './lambda/import-ext.lambda';
import { SystemExtensionProvider } from './provider/system-extension.provider';

@Module({
  providers: [
    ExtensionImportLambda,
    ExtensionService,
    ExtensionObserver,
    SystemExtensionProvider,
  ],
})
export class ExtensionModule implements IModule {
  constructor(
    @Inject(ExtensionService)
    readonly service: ExtensionService,
  ) {}

  async onStart() {
    await this.service.seed();
  }
}
