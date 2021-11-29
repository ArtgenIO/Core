import { FastifyInstance } from 'fastify';
import { decode } from 'jsonwebtoken';
import { AppModule } from '../../app/app.module';
import { IKernel, Kernel } from '../../app/kernel';
import { IJwtPayload } from './interface/jwt-payload.interface';

describe('Authentication (e2e)', () => {
  let app: IKernel;

  const getServer = (): Promise<FastifyInstance> =>
    app.context.get('providers.HttpServerProvider');

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.ARTGEN_DATABASE_DSN = 'sqlite::memory:';

    app = new Kernel();
    app.bootstrap([AppModule]);

    await app.start();
  }, 10_000);

  afterAll(async () => await app.stop());

  describe('JWT', () => {
    let authHeader: { authorization: string };

    beforeAll(async () => {
      const srv = await getServer();

      const response = await srv.inject({
        method: 'POST',
        url: '/api/authentication/jwt/sign-in',
        payload: {
          email: 'demo@artgen.io',
          password: 'demo',
        },
      });

      authHeader = {
        authorization: 'Bearer ' + response.json().accessToken,
      };
    });

    test('should respond unauthorized', async () => {
      const srv = await getServer();

      const response = await srv.inject({
        url: '/api/rest/system/database/system',
      });

      expect(response.statusCode).toBe(401);
    });

    test('should fail with 400', async () => {
      const srv = await getServer();

      const response = await srv.inject({
        method: 'POST',
        url: '/api/authentication/jwt/sign-in',
        payload: {
          email: 'asd',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('message');
      expect(response.json().message).toBe(
        'Request does not match the expected input data',
      );
    });

    test('should fail with bad password', async () => {
      const srv = await getServer();

      const response = await srv.inject({
        method: 'POST',
        url: '/api/authentication/jwt/sign-in',
        payload: {
          email: 'demo@artgen.io',
          password: 'almostdemo',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    test('should pass with the right credentials', async () => {
      const srv = await getServer();

      const response = await srv.inject({
        method: 'POST',
        url: '/api/authentication/jwt/sign-in',
        payload: {
          email: 'demo@artgen.io',
          password: 'demo',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('accessToken');
      expect(response.json().accessToken).toBeTruthy();
    });

    test('should generate an access token', async () => {
      const srv = await getServer();

      const response = await srv.inject({
        method: 'POST',
        url: '/api/authentication/jwt/sign-in',
        payload: {
          email: 'demo@artgen.io',
          password: 'demo',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('accessToken');
      expect(response.json().accessToken).toBeTruthy();
    });

    test('should accept the access token', async () => {
      const srv = await getServer();

      const response = await srv.inject({
        method: 'GET',
        url: '/api/rest/system/database/system',
        headers: authHeader,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('name');
      expect(response.json().name).toBe('system');
    });
  });

  describe('Access Key', () => {
    let validAccessKey: string;

    test('should respond without key', async () => {
      const srv = await getServer();

      const response = await srv.inject({
        method: 'GET',
        url: '/api/rest/system/database/system',
      });

      expect(response.statusCode).toBe(401);
    });

    test('should respond with invalid key format', async () => {
      const srv = await getServer();

      const response = await srv.inject({
        method: 'GET',
        url: '/api/rest/system/database/system?access-key=x',
      });

      expect(response.statusCode).toBe(401);
    });

    test('should respond with invalid key uuid query', async () => {
      const srv = await getServer();

      const response = await srv.inject({
        method: 'GET',
        url: '/api/rest/system/database/system?access-key=336373a4-f61a-4b08-b7b0-43d3147f6e58',
      });

      expect(response.statusCode).toBe(401);
    });

    test('should create an access key', async () => {
      const srv = await getServer();

      const signin = await srv.inject({
        method: 'POST',
        url: '/api/authentication/jwt/sign-in',
        payload: {
          email: 'demo@artgen.io',
          password: 'demo',
        },
      });

      const aid = (decode(signin.json().accessToken) as IJwtPayload).aid;
      expect(aid).toBeTruthy();

      const create = await srv.inject({
        method: 'POST',
        url: '/api/rest/system/access-key',
        headers: {
          Authorization: 'Bearer ' + signin.json().accessToken,
        },
        payload: {
          accountId: aid,
        },
      });

      const createResp = create.json();

      expect(create.statusCode).toBe(201);
      expect(createResp).toHaveProperty('key');
      expect(createResp).toHaveProperty('issuedAt');
      expect(createResp).toHaveProperty('accountId');
      expect(createResp.accountId).toBe(aid);

      validAccessKey = create.json().key;
    });

    test('should accept the access key (query)', async () => {
      const srv = await getServer();

      const response = await srv.inject({
        method: 'GET',
        url: '/api/rest/system/database/system?access-key=' + validAccessKey,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('name');
      expect(response.json().name).toBe('system');
    });

    test('should accept the access key (header)', async () => {
      const srv = await getServer();

      const response = await srv.inject({
        method: 'GET',
        url: '/api/rest/system/database/system',
        headers: {
          'X-Access-Key': validAccessKey,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('name');
      expect(response.json().name).toBe('system');
    });

    test('should be able to read the access key', async () => {
      const srv = await getServer();

      const response = await srv.inject({
        method: 'GET',
        url: '/api/rest/system/access-key/' + validAccessKey,
        headers: {
          'X-Access-Key': validAccessKey,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('key');
      expect(response.json().key).toBe(validAccessKey);
    });

    test('should be able to delete the access key', async () => {
      const srv = await getServer();

      const response = await srv.inject({
        method: 'DELETE',
        url: '/api/rest/system/access-key/' + validAccessKey,
        headers: {
          'X-Access-Key': validAccessKey,
        },
      });

      expect(response.statusCode).toBe(200);
    });

    test('should refuse deleted access key', async () => {
      const srv = await getServer();

      const delRes = await srv.inject({
        method: 'GET',
        url: '/api/rest/system/access-key/' + validAccessKey,
        headers: {
          'X-Access-Key': validAccessKey,
        },
      });

      expect(delRes.statusCode).toBe(401);
    });
  });
});
