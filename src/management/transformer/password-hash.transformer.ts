import { genSaltSync, hashSync } from 'bcrypt';
import { ValueTransformer } from 'typeorm';
import { Service } from '../../system/container';

@Service({
  tags: 'transformer',
})
export class PasswordHashTransformer implements ValueTransformer {
  to(plainPassword: string): string {
    if (plainPassword) {
      return hashSync(plainPassword, genSaltSync(4));
    }

    return plainPassword;
  }

  from(hashedPassword: string): string {
    return hashedPassword;
  }
}
