import { Service } from '@hisorange/kernel';
import { ITransformer } from './interface/transformer.interface';

@Service({
  tags: 'transformer',
})
export class JSONTransformer implements ITransformer {
  readonly reference: string = 'json';

  to(text: string): string {
    return JSON.stringify(text);
  }

  from(text: string): any {
    if (text) {
      return JSON.parse(text);
    }

    return text;
  }
}
