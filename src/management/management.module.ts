import { Module } from '../system/container';
import { BackOfficeModule } from './backoffice/backoffice.module';
import { LambdaModule } from './lambda/lambda.module';
import { TransformerModule } from './transformer/transformer.module';
import { ValidatorModule } from './validator/validator.module';
import { WorkflowModule } from './workflow/workflow.module';

@Module({
  imports: [
    LambdaModule,
    BackOfficeModule,
    TransformerModule,
    ValidatorModule,
    WorkflowModule,
  ],
})
export class ManagementModule {}
