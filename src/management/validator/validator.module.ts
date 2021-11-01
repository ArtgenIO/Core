import { Module } from '../../system/container';
import { ValidatorLambda } from './lambda/validator.node';

@Module({
  providers: [ValidatorLambda],
})
export class ValidatorModule {}
