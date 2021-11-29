import { Module } from '../../app/container';
import { ExtensionObserver } from './extension.observer';
import { ExtensionService } from './extension.service';
import { ExtensionImportLambda } from './lambda/import-ext.lambda';

@Module({
  providers: [ExtensionImportLambda, ExtensionService, ExtensionObserver],
})
export class ExtensionModule {}
