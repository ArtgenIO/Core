import { ILogger, Inject, Logger, Service } from '@hisorange/kernel';

import snakeCase from 'lodash.snakecase';
import MeiliSearch from 'meilisearch';
import { KeyValueService } from './key-value.service';
import { SchemaService } from './schema.service';

const HOST_REF = 'meili.host';
const API_REF = 'meili.key';

@Service()
export class SearchService {
  protected client: MeiliSearch = null;

  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(KeyValueService)
    readonly kv: KeyValueService,
    @Inject(SchemaService)
    readonly schema: SchemaService,
  ) {}

  async isAvailable(): Promise<boolean> {
    if (process.env.ARTGEN_MEILI_HOST) {
      return true;
    }

    return !!(await this.kv.get(HOST_REF));
  }

  async getClient(): Promise<MeiliSearch | null> {
    if (!this.client) {
      if (await this.isAvailable()) {
        const host = await this.kv.get(HOST_REF, process.env.ARTGEN_MEILI_HOST);
        const apiKey = await this.kv.get(API_REF, process.env.ARTGEN_MEILI_KEY);

        this.client = new MeiliSearch({ host, apiKey });

        return this.client;
      }
    }

    return null;
  }

  async index(database: string, schema: string) {
    const model = this.schema.getModel(database, schema);

    return (await this.getClient())
      .index(snakeCase(`${database}_${schema}`))
      .addDocuments(await model.query());
  }

  async query(database: string, schema: string, term: string) {
    return (await this.getClient())
      .index(snakeCase(`${database}_${schema}`))
      .search(term);
  }
}
