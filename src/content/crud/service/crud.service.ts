import { merge } from 'lodash';
import { executeQuery } from 'odata-v4-typeorm';
import { ILogger, Inject, Logger, Service } from '../../../system/container';
import { FieldTag } from '../../schema';
import { SchemaService } from '../../schema/service/schema.service';

@Service()
export class CrudService {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject('classes.SchemaService')
    readonly schema: SchemaService,
  ) {}

  async create(
    database: string,
    reference: string,
    data: unknown,
  ): Promise<unknown[]> {
    const repository = this.schema.getRepository(database, reference);
    const row = repository.create(data);

    await repository.save(row);

    return row;
  }

  async read(
    database: string,
    reference: string,
    odata: Record<string, unknown>,
  ): Promise<unknown[]> {
    const repository = this.schema.getRepository(database, reference);
    const baseOptions = {
      $top: 10,
      $skip: 0,
    };

    const rows = await executeQuery(repository, merge(baseOptions, odata), {});

    return rows;
  }

  async update(
    database: string,
    reference: string,
    odata: Record<string, unknown>,
    data: object,
  ): Promise<unknown> {
    const schema = this.schema.findOne(database, reference).schema;
    const repository = this.schema.getRepository(database, reference);
    const baseOptions = {
      $top: 1,
      $skip: 0,
    };

    const rows = await executeQuery(repository, merge(odata, baseOptions), {});

    if (!rows.length) {
      throw new Error('Not a found');
    }

    const record = rows[0];

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        const def = schema.fields.find(f => f.reference === key);

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

        record[key] = value;
      }
    }

    // Save changes
    await repository.save(record);

    return record;
  }

  async delete(
    database: string,
    reference: string,
    odata: Record<string, unknown>,
  ): Promise<unknown> {
    const repository = this.schema.getRepository(database, reference);
    const baseOptions = {
      $top: 1,
      $skip: 0,
    };

    const rows = await executeQuery(repository, merge(odata, baseOptions), {});

    if (!rows.length) {
      throw new Error('Not a found');
    }

    const record = rows[0];

    await repository.remove(record);

    return record;
  }
}
