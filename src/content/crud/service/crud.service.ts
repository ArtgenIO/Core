import { merge } from 'lodash';
import parseOData from 'odata-sequelize';
import { stringify } from 'querystring';
import { ILogger, Inject, Logger, Service } from '../../../system/container';
import { FieldTag } from '../../schema';
import { SchemaService } from '../../schema/service/schema.service';

@Service()
export class CrudService {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(SchemaService)
    readonly schema: SchemaService,
  ) {}

  async create(
    database: string,
    reference: string,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const model = this.schema.model(database, reference);
    const row = await model.create(data);

    return row.get({ plain: true });
  }

  async readOData<T = Record<string, unknown>>(
    database: string,
    reference: string,
    odata: Record<string, unknown>,
  ): Promise<any[]> {
    const model = this.schema.model(database, reference);
    const options = merge(
      {
        $top: 10,
        $skip: 0,
      },
      odata,
    );

    const q = decodeURIComponent(stringify(options as any));

    this.logger.info('Got [%s]', q);

    const query = parseOData(q, model.sequelize);
    const rows = await model.findAll(query);

    return rows.map(r => r.get({ plain: true }));
  }

  async update(
    database: string,
    reference: string,
    odata: Record<string, unknown>,
    data: object,
  ): Promise<unknown> {
    const schema = this.schema.findOne(database, reference);
    const model = this.schema.model(database, reference);
    const options = merge(odata, {
      $top: 1,
      $skip: 0,
    });

    const q = decodeURIComponent(stringify(options as any));

    const query = parseOData(q.toString(), model.sequelize);
    const rows = await model.findAll(query);

    if (!rows.length) {
      throw new Error('Not a found');
    }

    const record = rows[0];

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        const def = schema.fields.find(f => f.reference === key);

        // Extra field?
        if (!def) {
          this.logger.warn(
            'Field [%s] does not exists on the schema [%s]',
            key,
            schema.reference,
          );
          continue;
        }

        // Skip on generated fields.
        if (
          def.tags.includes(FieldTag.PRIMARY) ||
          def.tags.includes(FieldTag.CREATED) ||
          def.tags.includes(FieldTag.UPDATED) ||
          def.tags.includes(FieldTag.DELETED) ||
          def.tags.includes(FieldTag.VERSION)
        ) {
          continue;
        }

        record.set(key, value);
      }
    }

    // Save changes
    await record.save();

    return record;
  }

  async delete(
    database: string,
    reference: string,
    odata: Record<string, unknown>,
  ): Promise<unknown> {
    const model = this.schema.model(database, reference);
    const options = merge(odata, {
      $top: 1,
      $skip: 0,
    });
    const q = decodeURIComponent(stringify(options as any));

    const query = parseOData(q.toString(), model.sequelize);
    const rows = await model.findAll(query);

    if (!rows.length) {
      throw new Error('Not a found');
    }

    const record = rows[0];

    await record.destroy();

    return record;
  }
}
