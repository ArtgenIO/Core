import { IKernel, Kernel } from '@hisorange/kernel';
import { FastifyInstance } from 'fastify';
import { Application } from '../../src/application';
import { HttpUpstreamProvider } from '../../src/providers/http-upstream.provider';

describe('Application (e2e)', () => {
  let app: IKernel;

  const getServer = (): Promise<FastifyInstance> =>
    app.context.get('providers.' + HttpUpstreamProvider.name);

  beforeAll(async () => {
    app = new Kernel();
    app.register([Application]);

    await app.boostrap();
    await app.start();

    // Wait until it the HttpServer is ready
  }, 30_000);

  afterAll(async () => {
    (await getServer()).close();
    await app.stop();
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
      url: '/swagger',
    });

    expect(response.statusCode).toBe(302);
  });

  test('should serve the [openapi] response', async () => {
    const srv = await getServer();

    const response = await srv.inject({
      url: '/swagger/static/index.html',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatch(/swagger/);
  });

  describe('Rest', () => {
    let authHeader: { authorization: string };

    beforeAll(async () => {
      const srv = await getServer();

      await srv.inject({
        method: 'POST',
        url: '/api/identity/signup',
        payload: {
          email: 'demo@artgen.io',
          password: 'demo',
        },
      });

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

    test('should be able to read the main database', async () => {
      const srv = await getServer();

      const response = await srv.inject({
        method: 'GET',
        url: '/api/rest/main/database/main',
        headers: authHeader,
      });

      expect(response.statusCode).toBe(200);
    });

    // Need to have some transformer to handle this JSON hacks, simply can't store JSON encoded string with most of the driver.
    test.skip('should be able to create array KV', async () => {
      const srv = await getServer();
      const payload = {
        key: 'testarr',
        value: ['a', 'b', 'c'],
      };

      const response = await srv.inject({
        method: 'POST',
        url: '/api/rest/main/key-value-storage',
        headers: authHeader,
        payload,
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toStrictEqual(payload);

      const readback = await srv.inject({
        method: 'GET',
        url: '/api/rest/main/key-value-storage/testarr',
        headers: authHeader,
      });

      expect(readback.statusCode).toBe(200);
      expect(readback.json()).toStrictEqual(payload);
    });

    test.skip('should be able to create string KV', async () => {
      const srv = await getServer();
      const payload = {
        key: 'teststr',
        value: 'stringed',
      };

      const response = await srv.inject({
        method: 'POST',
        url: '/api/rest/main/key-value-storage',
        headers: authHeader,
        payload,
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toStrictEqual(payload);

      const readback = await srv.inject({
        method: 'GET',
        url: '/api/rest/main/key-value-storage/teststr',
        headers: authHeader,
      });

      expect(readback.statusCode).toBe(200);
      expect(readback.json()).toStrictEqual(payload);
    });
  });

  describe('Security', () => {
    test.each(['/wp-login.php', '/wp-admin', '/config-dist.php'])(
      'should respond to [%s] trap URL',
      async (url: string) => {
        const srv = await getServer();

        const response = await srv.inject({
          url,
        });

        expect(response.statusCode).toBe(200);
        expect(response.headers['x-artgen-security']).toBe('violated');
      },
    );
  });
});
