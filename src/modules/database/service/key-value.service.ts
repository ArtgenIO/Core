import { Inject, Service } from '@hisorange/kernel';
import { Model } from 'objection';
import { SchemaRef } from '../../schema/interface/system-ref.enum';
import { IKeyValueRecord } from '../interface/key-value.interface';
import { SchemaService } from './schema.service';

type KVModel = IKeyValueRecord<any> & Model;

@Service()
export class KeyValueService {
  readonly cache = new Map<string, unknown>();

  constructor(
    @Inject(SchemaService)
    readonly schema: SchemaService,
  ) {}

  async get<T = string>(key: string, defaultValue: T = null): Promise<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }

    const model = this.schema.getSysModel<KVModel>(SchemaRef.KV);
    const record = await model.query().findById(key);

    if (record) {
      this.cache.set(key, record.value);

      return record.value as unknown as T;
    }

    return defaultValue;
  }

  async set<T = string>(key: string, value: T): Promise<T> {
    const model = this.schema.getSysModel<KVModel>(SchemaRef.KV);
    let record = await model.query().findById(key);

    this.cache.set(key, value);

    if (!record) {
      record = await model
        .query()
        .insertAndFetch({ key, value } as unknown as IKeyValueRecord);
    } else {
      record.$set({ key, value });

      await record.$query().update();
    }

    return value;
  }
}
