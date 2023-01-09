import { ILogger, Inject, Logger, Service } from '@hisorange/kernel';
import { nanoid } from 'nanoid';
import { Model } from 'objection';
import { IAccount } from '../models/account.interface';
import { IAccessKey } from '../types/access-key.interface';
import { SchemaRef } from '../types/system-ref.enum';
import { KeyValueService } from './key-value.service';
import { SchemaService } from './schema.service';

type AccountModel = IAccount & Model;

@Service()
export class AuthenticationService {
  protected deleteTimeout: NodeJS.Timeout;
  protected jwtSecret: string;

  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(SchemaService)
    readonly schema: SchemaService,
    @Inject(KeyValueService)
    readonly kv: KeyValueService,
  ) {}

  async getJwtSecret(): Promise<string> {
    if (!this.jwtSecret) {
      const key = 'authentication.jwt.secret';
      let secret = await this.kv.get(key);

      if (secret === null) {
        secret = await this.kv.set(
          key,
          process.env.ARTGEN_JWT_SECRET ?? nanoid(32),
        );
      }

      this.jwtSecret = secret;
    }

    return this.jwtSecret;
  }

  async getAccountByID(id: string): Promise<IAccount | false> {
    const model = this.schema.getSysModel<AccountModel>(SchemaRef.ACCOUNT);
    const record = await model.query().findById(id);

    if (record) {
      return record.$toJson();
    }

    return false;
  }

  async getAccessKeyAccount(key: string): Promise<Partial<IAccount> | false> {
    const model = this.schema.getSysModel<AccountModel>(SchemaRef.ACCESS_KEY);
    const record = await model
      .query()
      .findById(key)
      .withGraphFetched('account');

    if (record) {
      return {
        id: (record as unknown as IAccessKey).account.id,
        email: (record as unknown as IAccessKey).account.email,
      };
    }

    return false;
  }
}
