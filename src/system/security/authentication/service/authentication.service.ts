import { compare, hashSync } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { KeyValueService } from '../../../../content/schema/service/key-value.service';
import { SchemaService } from '../../../../content/schema/service/schema.service';
import { ILogger, Inject, Logger } from '../../../container';
import { IAccessKey } from '../interface/access-key.interface';
import { IAccount } from '../interface/account.interface';
import { IJwtPayload } from '../interface/jwt-payload.interface';

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
    const model = this.schema.model<IAccount>('system', 'Account');

    const account = await model.findOne({
      where: {
        email: credentials.email,
      },
    });

    if (account) {
      const isPasswordValid = await compare(
        credentials.password,
        account.get('password') as string,
      );

      if (isPasswordValid) {
        const payload: IJwtPayload = {
          aid: account.get('id') as string,
          roles: [],
        };

        return sign(payload, await this.getJwtSecret(), {
          expiresIn: '1h',
        });
      }
    }

    return false;
  }

  async getAccountByID(id: string): Promise<IAccount | false> {
    const model = this.schema.model<IAccount>('system', 'Account');
    const record = await model.findByPk(id);

    if (record) {
      return record.get({ plain: true });
    }

    return false;
  }

  async getAccessKeyAccount(key: string): Promise<IAccount | false> {
    const model = this.schema.model<IAccessKey>('system', 'AccessKey');
    const record = await model.findOne({
      where: {
        key: key,
      },
      include: ['account'],
    });

    if (record) {
      return {
        id: (record as unknown as IAccessKey).account.id,
        email: (record as unknown as IAccessKey).account.email,
      };
    }

    return false;
  }

  async seed() {
    // Seed the demo account
    this.logger.debug('Seeding [demo] account');

    const model = this.schema.model('system', 'Account');
    const check = await model.count({
      where: {
        email: 'demo@artgen.io',
      },
    });

    if (check) {
      return;
    }

    const account = await model.create({
      email: 'demo@artgen.io',
      password: hashSync('demo', 3),
    });

    this.logger.info(
      'Demo account is ready under the [demo@artgen.io] email address',
    );

    // Remove demo account after half an hour.
    this.deleteTimeout = setTimeout(() => {
      account.set(
        'password',
        hashSync((Date.now() * Math.random()).toString(), 3),
      );

      account.save();

      this.logger.warn('Demo account is disabled');
    }, 1_800_000);
  }

  clearDeleteTimeout() {
    if (this.deleteTimeout) {
      clearTimeout(this.deleteTimeout);
    }
  }
}
