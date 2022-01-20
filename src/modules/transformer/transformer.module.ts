import { Module } from '../../app/container';
import { Base16Transformer } from './base16.transformer';
import { Base64Transformer } from './base64.transformer';
import { KebabCaseTransformer } from './kebab-case.transformer';
import { PasswordHashTransformer } from './password-hash.transformer';
import { SnakeCaseTransformer } from './snake-case.transformer';

@Module({
  providers: [
    PasswordHashTransformer,
    Base64Transformer,
    Base16Transformer,
    SnakeCaseTransformer,
    KebabCaseTransformer,
  ],
})
export class TransformerModule {}
