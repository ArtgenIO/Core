import { Module } from '../../system/container';
import { ReadLambdaLambda } from './lambda/read-lambda.lambda';
import { LambdaService } from './service/lambda.service';
import { HttpTrigger } from './trigger/http.trigger';

@Module({
  providers: [HttpTrigger, LambdaService, ReadLambdaLambda],
})
export class LambdaModule {}
