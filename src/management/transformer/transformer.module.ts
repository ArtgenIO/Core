import { Module } from '../../system/container';
import { PasswordHashTransformer } from './password-hash.transformer';

@Module({
  providers: [PasswordHashTransformer],
})
export class TransformerModule {}
