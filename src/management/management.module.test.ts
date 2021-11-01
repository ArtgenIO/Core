import { Reflector } from '@loopback/metadata';
import { IModuleMeta, MODULE_KEY } from '../system/container';
import { BackOfficeModule } from './backoffice/backoffice.module';
import { LambdaModule } from './lambda/lambda.module';
import { ManagementModule } from './management.module';
import { TransformerModule } from './transformer/transformer.module';
import { ValidatorModule } from './validator/validator.module';
import { WorkflowModule } from './workflow/workflow.module';

describe('ManagementModule', () => {
  test('should have the @Module decorator', () => {
    const hasModuleDecorator = Reflector.hasOwnMetadata(
      MODULE_KEY,
      ManagementModule,
    );

    expect(hasModuleDecorator).toBeTruthy();
  });

  test('should import the backoffice module', () => {
    const meta: IModuleMeta = Reflector.getOwnMetadata(
      MODULE_KEY,
      ManagementModule,
    );

    expect(meta.imports.includes(BackOfficeModule)).toBeTruthy();
  });

  test('should import the workflow module', () => {
    const meta: IModuleMeta = Reflector.getOwnMetadata(
      MODULE_KEY,
      ManagementModule,
    );

    expect(meta.imports.includes(WorkflowModule)).toBeTruthy();
  });

  test('should import the transformer module', () => {
    const meta: IModuleMeta = Reflector.getOwnMetadata(
      MODULE_KEY,
      ManagementModule,
    );

    expect(meta.imports.includes(TransformerModule)).toBeTruthy();
  });

  test('should import the validator module', () => {
    const meta: IModuleMeta = Reflector.getOwnMetadata(
      MODULE_KEY,
      ManagementModule,
    );

    expect(meta.imports.includes(ValidatorModule)).toBeTruthy();
  });

  test('should import the node module', () => {
    const meta: IModuleMeta = Reflector.getOwnMetadata(
      MODULE_KEY,
      ManagementModule,
    );

    expect(meta.imports.includes(LambdaModule)).toBeTruthy();
  });
});
