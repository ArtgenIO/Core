import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { Model } from 'objection';
import { ILogger, Inject, Logger } from '../../../app/container';
import { KeyValueService } from '../../schema/service/key-value.service';
import { SchemaService } from '../../schema/service/schema.service';
import { IAccessKey } from '../interface/access-key.interface';
import { IAccount } from '../interface/account.interface';
import { IJwtPayload } from '../interface/jwt-payload.interface';

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

  async sigInWithCredentials(credentials: {
    email: string;
    password: string;
  }): Promise<string | false> {
    const model = this.schema.getModel<AccountModel>('main', 'Account');

    const account = await model.query().findOne({
      email: credentials.email,
    });

    if (account) {
      const isPasswordValid = await compare(
        credentials.password,
        account.password,
      );

      if (isPasswordValid) {
        const payload: IJwtPayload = {
          aid: account.id,
          roles: [],
        };

        return sign(payload, await this.getJwtSecret(), {
          expiresIn: '8h',
        });
      }
    }

    return false;
  }

  async getAccountByID(id: string): Promise<IAccount | false> {
    const model = this.schema.getModel<AccountModel>('main', 'Account');
    const record = await model.query().findById(id);

    if (record) {
      return record.$toJson();
    }

    return false;
  }

  async getAccessKeyAccount(key: string): Promise<IAccount | false> {
    const model = this.schema.getModel<AccountModel>('main', 'AccessKey');
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

  async seed() {
    const model = this.schema.getModel<AccountModel>('main', 'Account');
    const check = await model.query().limit(1).resultSize();

    if (check) {
      return;
    }

    // Seed the demo account
    this.logger.debug('Seeding [demo] account');

    await model.query().insert({
      email: 'demo@artgen.io',
      password: 'demo',
    });

    this.logger.info(
      'Demo account is ready under the [demo@artgen.io] email address',
    );
  }
}
