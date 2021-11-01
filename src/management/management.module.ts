import { Module } from '../system/container';
import { DatabaseModule } from '../system/database/database.module';
import { BackOfficeModule } from './backoffice/backoffice.module';
import { LambdaModule } from './lambda/lambda.module';
import { TransformerModule } from './transformer/transformer.module';
import { ValidatorModule } from './validator/validator.module';
import { WorkflowModule } from './workflow/workflow.module';

@Module({
  exports: [
    LambdaModule,
    BackOfficeModule,
    TransformerModule,
    ValidatorModule,
    WorkflowModule,
  ],
  dependsOn: [DatabaseModule],
})
export class ManagementModule {}
