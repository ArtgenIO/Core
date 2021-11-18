import { FastifyInstance } from 'fastify';
import { createLogger } from 'winston';
import { AppModule } from '../src/app.module';
import { IKernel, Kernel } from '../src/system/kernel';

describe('Application (e2e)', () => {
  let app: IKernel;

  const getServer = (): Promise<FastifyInstance> =>
    app.context.get('providers.HttpServerProvider');

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.ARTGEN_DATABASE_DSN = 'sqlite::memory:';
    Kernel.prototype['createLogger'] = createLogger;

    app = new Kernel();
    app.bootstrap([AppModule]);

    await app.start();
  });

  afterAll(async () => await app.stop());

  test('should server the [home] page', async () => {
    const srv = await getServer();

    const response = await srv.inject({
      url: '/',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatch(/html/);
  });

  test('should serve the [backoffice] page', async () => {
    const srv = await getServer();

    const response = await srv.inject({
      url: '/backoffice/index.html',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatch(/html/);
  });

  test('should serve the [404] response', async () => {
    const srv = await getServer();

    const response = await srv.inject({
      url: '/404-test-not-existing',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toStrictEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Not found.',
    });
  });

  test('should reditect the [openapi] request', async () => {
    const srv = await getServer();

    const response = await srv.inject({
      url: '/api/docs',
    });

    expect(response.statusCode).toBe(302);
  });

  test('should serve the [openapi] response', async () => {
    const srv = await getServer();

    const response = await srv.inject({
      url: '/api/docs/static/index.html',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatch(/swagger/);
  });

  describe('Authentication', () => {
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
  });

  describe('Rest', () => {
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

    test('should be able to read the system database', async () => {
      const srv = await getServer();

      const response = await srv.inject({
        method: 'GET',
        url: '/api/rest/system/database/system',
        headers: authHeader,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('name');
      expect(response.json()).toHaveProperty('dsn');
      expect(response.json().name).toBe('system');
      expect(response.json().dsn).toBe('sqlite::memory:');
    });

    test('should be able to create array KV', async () => {
      const srv = await getServer();
      const payload = {
        key: 'testarr',
        value: ['a', 'b', 'c'],
      };

      const response = await srv.inject({
        method: 'POST',
        url: '/api/rest/system/key-value-storage',
        headers: authHeader,
        payload,
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toStrictEqual(payload);

      const readback = await srv.inject({
        method: 'GET',
        url: '/api/rest/system/key-value-storage/testarr',
        headers: authHeader,
      });

      expect(readback.statusCode).toBe(200);
      expect(readback.json()).toStrictEqual(payload);
    });

    test('should be able to create string KV', async () => {
      const srv = await getServer();
      const payload = {
        key: 'teststr',
        value: 'stringed',
      };

      const response = await srv.inject({
        method: 'POST',
        url: '/api/rest/system/key-value-storage',
        headers: authHeader,
        payload,
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toStrictEqual(payload);

      const readback = await srv.inject({
        method: 'GET',
        url: '/api/rest/system/key-value-storage/teststr',
        headers: authHeader,
      });

      expect(readback.statusCode).toBe(200);
      expect(readback.json()).toStrictEqual(payload);
    });
  });
});
