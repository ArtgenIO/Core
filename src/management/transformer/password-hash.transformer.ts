import { genSaltSync, hashSync } from 'bcrypt';
import { Service } from '../../system/container';

@Service({
  tags: 'transformer',
})
export class PasswordHashTransformer {
  to(plainPassword: string): string {
    return hashSync(plainPassword, genSaltSync(4));
  }

  from(hashedPassword: string): string {
    return hashedPassword;
  }
}
