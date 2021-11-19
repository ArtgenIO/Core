import { Provider } from '@loopback/context';
import { Authenticator } from 'fastify-passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { UniqueTokenStrategy } from 'passport-unique-token';
import isUUID from 'validator/lib/isUUID';
import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { AuthenticationService } from '../service/authentication.service';

@Service(Authenticator)
export class AuthenticatorProvider implements Provider<Authenticator> {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(AuthenticationService)
    readonly service: AuthenticationService,
  ) {}

  async value(): Promise<Authenticator> {
    const auth = new Authenticator();

    const jwtSecret = await this.service.getJwtSecret();

    auth.use(
      new JwtStrategy(
        {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: jwtSecret,
        },
        (payload: any, done) => {
          this.service
            .getAccountByID(payload.aid)
            .then(acc => {
              if (!acc) {
                // TODO: hack attempt hit
                done(null, false, 'Account does not exists!');
              } else {
                done(null, acc);
              }
            })
            .catch(e => {
              done(null, false, 'Invalid account ID!');
            });
        },
      ),
    );

    auth.use(
      new UniqueTokenStrategy(
        {
          caseSensitive: false,
          tokenQuery: 'access-key',
          tokenHeader: 'X-Access-Key',
          failOnMissing: true,
        },
        (token: string, done) => {
          if (!isUUID(token)) {
            return done(null, false, 'Invalid format');
          }

          this.service
            .getAccessKeyAccount(token)
            .then(acc => {
              if (!acc) {
                // TODO: hack attempt hit
                done(null, false, 'Unknown access key!');
              } else {
                done(null, acc);
              }
            })
            .catch(e => {
              done(null, false, 'Invalid access key!');
            });
        },
      ),
    );

    return auth;
  }
}
