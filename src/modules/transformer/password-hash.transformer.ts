import { genSaltSync, hashSync } from 'bcrypt';
import { Service } from '../../app/container';
import { ITransformer } from './interface/transformer.interface';

@Service({
  tags: 'transformer',
})
export class PasswordHashTransformer implements ITransformer {
  readonly reference: string = 'passwordHash';

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
