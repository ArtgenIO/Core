import { kebabCase } from 'lodash';
import { Service } from '../../app/container';
import { ITransformer } from './interface/transformer.interface';

@Service({
  tags: 'transformer',
})
export class KebabCaseTransformer implements ITransformer {
  readonly reference: string = 'kebabCase';

  to(text: string): string {
    if (text) {
      return kebabCase(text);
    }

    return text;
  }

  from(text: string): string {
    return text;
  }
}
