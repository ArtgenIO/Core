import { ILogger, Inject, Logger } from '@hisorange/kernel';
import { nanoid } from 'nanoid';
import { Model } from 'objection';
import { SchemaRef } from '../../schema/interface/system-ref.enum';
import { KeyValueService } from '../../schema/service/key-value.service';
import { SchemaService } from '../../schema/service/schema.service';
import { IAccessKey } from '../interface/access-key.interface';
import { IAccount } from '../interface/account.interface';

type AccountModel = IAccount & Model;

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
        secret = await this.kv.set(key, nanoid(32));
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

  async isSignUpAvailable() {
    const model = this.schema.getSysModel<AccountModel>(SchemaRef.ACCOUNT);
    const result = (await model
      .query()
      .limit(1)
      .count('* as count')
      .toKnexQuery()) as unknown as { count: string }[];

    return !parseInt(result[0].count, 10);
  }
}
