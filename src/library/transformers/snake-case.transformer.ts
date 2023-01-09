import { Service } from '@hisorange/kernel';
import snakeCase from 'lodash.snakecase';
import { ITransformer } from '../../types/transformer.interface';

@Service({
  tags: 'transformer',
})
export class SnakeCaseTransformer implements ITransformer {
  readonly reference: string = 'snakeCase';

  to(text: string): string {
    if (text) {
      return snakeCase(text);
    }

    return text;
  }

  from(text: string): string {
    return text;
  }
}
