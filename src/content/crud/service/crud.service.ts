import { v4 } from 'uuid';
import { ILogger, Inject, Logger, Service } from '../../../system/container';
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
    databaseName: string,
    schemaRef: string,
    record: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const repository = this.schema.getRepository(databaseName, schemaRef);
    const entity = repository.create(record);

    // Use UUID
    if (Object.prototype.hasOwnProperty.call(entity, 'id')) {
      // TODO: check for mongo, check the schema for type, etc...
      if (!entity.id) {
        entity.id = v4();
      }
    }

    // TODO: Apply setters if the driver is mongoDB

    return repository.save(record);
  }
}
