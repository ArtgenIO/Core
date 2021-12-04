import { Model } from 'objection';
import { Inject, Service } from '../../../app/container';
import { IKeyValueRecord } from '../../content/interface/key-value.interface';
import { SchemaService } from './schema.service';

type KVModel = IKeyValueRecord<any> & Model;

@Service()
export class KeyValueService {
  constructor(
    @Inject(SchemaService)
    readonly schema: SchemaService,
  ) {}

  async get<T = string>(key: string, defaultValue: T = null): Promise<T> {
    const model = this.schema.getModel<KVModel>('system', 'KeyValueStorage');
    const record = await model.query().findById(key);

    if (record) {
      return record.value.v;
    }

    return defaultValue;
  }

  async set<T = string>(key: string, value: T): Promise<T> {
    const model = this.schema.getModel<KVModel>('system', 'KeyValueStorage');
    let record = await model.query().findById(key);

    if (!record) {
      record = await model.query().insertAndFetch({ key, value: { v: value } });
    } else {
      record.$set({ key, value });

      await record.$query().update();
    }

    return value;
  }
}
