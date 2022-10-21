import { Module } from '@hisorange/kernel';
import { CompareLambda } from './lambda/if.lambda';
import { LengthLambda } from './lambda/length.lambda';
import { ReadLambdaLambda } from './lambda/read-lambda.lambda';
import { LambdaService } from './service/lambda.service';

@Module({
  providers: [LambdaService, ReadLambdaLambda, LengthLambda, CompareLambda],
})
export class LambdaModule {}
