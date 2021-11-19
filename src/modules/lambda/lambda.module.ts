import { Module } from '../../app/container';
import { ReadLambdaLambda } from './lambda/read-lambda.lambda';
import { LambdaService } from './service/lambda.service';

@Module({
  providers: [LambdaService, ReadLambdaLambda],
})
export class LambdaModule {}
