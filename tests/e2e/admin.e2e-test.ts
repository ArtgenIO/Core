import { IKernel, Kernel } from '@hisorange/kernel';
import { FastifyInstance } from 'fastify';
import { Admin } from '../../src/admin';
import { Application } from '../../src/application';
import { HttpUpstreamProvider } from '../../src/providers/http-upstream.provider';

describe.skip('Admin (e2e)', () => {
  let app: IKernel;

  const getServer = (): Promise<FastifyInstance> =>
    app.context.get('providers.' + HttpUpstreamProvider.name);

  beforeAll(async () => {
    app = new Kernel();
    app.register([Admin, Application]);

    await app.boostrap();
    await app.start();

    // Wait until it the HttpServer is ready
  }, 30_000);

  afterAll(async () => {
    (await getServer()).close();
    await app.stop();
  });

  test('should serve the [admin] page', async () => {
    const srv = await getServer();

    const response = await srv.inject({
      url: '/admin/index.html',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatch(/html/);
  });
});
