import { ILogger, Inject, Logger } from '@hisorange/kernel';
import { IKeyValueRecord } from '../content/interface/key-value.interface';
import { Observer, On } from '../event';
import { SchemaRef } from '../schema/interface/system-ref.enum';
import { KeyValueService } from './service/key-value.service';

@Observer()
export class SchemaObserve {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(KeyValueService)
    readonly service: KeyValueService,
  ) {}

  @On(`crud.main.${SchemaRef.KV}.*`)
  async clearCache(kv: IKeyValueRecord) {
    if (this.service.cache.has(kv.key)) {
      this.service.cache.delete(kv.key);
      this.logger.info('KeyValue [%s] cache cleared', kv.key);
    }
  }
}
