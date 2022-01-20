import { snakeCase } from 'lodash';
import { Service } from '../../app/container';
import { ITransformer } from './interface/transformer.interface';

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
