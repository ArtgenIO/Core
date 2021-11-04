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

  async create(schemaId: string, data: unknown): Promise<unknown[]> {
    const schema = await this.schema.findById(schemaId);
    const repository = this.schema.getRepository(
      schema.database,
      schema.reference,
    );
    const row = repository.create(data);

    await repository.save(row);

    return row;
  }

  async fetchAll(schemaId: string): Promise<unknown[]> {
    const schema = await this.schema.findById(schemaId);
    const repository = this.schema.getRepository(
      schema.database,
      schema.reference,
    );
    const rows = await repository.find();

    return rows;
  }

  async fetchOne(schemaId: string, recordId: string): Promise<unknown> {
    const schema = await this.schema.findById(schemaId);
    const repository = this.schema.getRepository(
      schema.database,
      schema.reference,
    );
    const record = await repository.findOneOrFail(recordId);

    return record;
  }

  async update(
    schemaId: string,
    recordId: string,
    data: object,
  ): Promise<unknown> {
    const schema = await this.schema.findById(schemaId);
    const repository = this.schema.getRepository(
      schema.database,
      schema.reference,
    );
    const record = await repository.findOneOrFail(recordId);

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

  async delete(schemaId: string, recordId: string): Promise<unknown> {
    const schema = await this.schema.findById(schemaId);
    const repository = this.schema.getRepository(
      schema.database,
      schema.reference,
    );
    const record = await repository.findOneOrFail(recordId);

    await repository.remove(record);

    return record;
  }
}
