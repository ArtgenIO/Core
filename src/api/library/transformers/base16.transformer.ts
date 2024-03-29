import { Service } from '@hisorange/kernel';
import { ITransformer } from '../../types/transformer.interface';

@Service({
  tags: 'transformer',
})
export class Base16Transformer implements ITransformer {
  readonly reference: string = 'base16';

  to(text: string): string {
    if (text) {
      return Buffer.from(text).toString('hex');
    }

    return text;
  }

  from(text: string): string {
    if (text) {
      return Buffer.from(text, 'hex').toString();
    }

    return text;
  }
}
