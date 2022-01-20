import { Module } from '../../app/container';
import { Base16Transformer } from './base16.transformer';
import { Base64Transformer } from './base64.transformer';
import { PasswordHashTransformer } from './password-hash.transformer';

@Module({
  providers: [PasswordHashTransformer, Base64Transformer, Base16Transformer],
})
export class TransformerModule {}
