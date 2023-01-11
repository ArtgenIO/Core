import { Service } from '@hisorange/kernel';
import { ITransformer } from '../../types/transformer.interface';

@Service({
  tags: 'transformer',
})
export class Base64Transformer implements ITransformer {
  readonly reference: string = 'base64';

  to(text: string): string {
    if (text) {
      return Buffer.from(text, 'utf-8').toString('base64');
    }

    return text;
  }

  from(text: string): string {
    if (text) {
      return Buffer.from(text, 'base64').toString('utf-8');
    }

    return text;
  }
}
