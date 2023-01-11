import { Base16Transformer } from '../library/transformers/base16.transformer';
import { Base64Transformer } from '../library/transformers/base64.transformer';
import { JSONTransformer } from '../library/transformers/json.transformer';
import { KebabCaseTransformer } from '../library/transformers/kebab-case.transformer';
import { PasswordHashTransformer } from '../library/transformers/password-hash.transformer';
import { SnakeCaseTransformer } from '../library/transformers/snake-case.transformer';

export const TransformeProviders = [
  Base16Transformer,
  Base64Transformer,
  JSONTransformer,
  KebabCaseTransformer,
  PasswordHashTransformer,
  SnakeCaseTransformer,
];
