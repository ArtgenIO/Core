import { genSaltSync, hashSync } from 'bcrypt';
import { Service } from '../../system/container';

@Service({
  tags: 'transformer',
})
export class PasswordHashTransformer {
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
