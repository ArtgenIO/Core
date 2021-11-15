import { Inject, Service } from '../../../system/container';
import { IKeyValueRecord } from '../../crud/interface/key-value.interface';
import { SchemaService } from './schema.service';

@Service()
export class KeyValueService {
  constructor(
    @Inject(SchemaService)
    readonly schema: SchemaService,
  ) {}

  async get<T = string>(key: string, defaultValue: any = null): Promise<T> {
    const model = this.schema.model<IKeyValueRecord<T>>(
      'system',
      'KeyValueStorage',
    );
    const record = await model.findByPk(key);

    if (record !== null) {
      return record.getDataValue('value');
    }

    return defaultValue;
  }

  async set<T = string>(key: string, value: T): Promise<T> {
    const model = this.schema.model<IKeyValueRecord<T>>(
      'system',
      'KeyValueStorage',
    );
    let record = await model.findOne({
      where: {
        key,
      },
    });

    if (!record) {
      record = model.build();
    }

    record.setAttributes({
      key,
      value,
    });

    await record.save();

    return record.get('value') as T;
  }
}
